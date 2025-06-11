class LaundryMenu extends HTMLElement {
    constructor() {
        super();
        
        // Ocultar completamente el componente hasta verificar todo
        this.style.display = 'none';
        
        // Inicializar estructura
        this.innerHTML = `
            <style>
                .admin-only {
                    display: none;
                }
            </style>

            <div class="BarraMenu">
                <div class="BarraMenu_Left">
                    <div class="menu_tittle">
                        <img src="./img/Paris Laundry 1.png" alt="Logo">
                        <div>
                        <h1>Paris Laundry</h1>
                        <h2 class="admin-only">ADMINISTRADOR</h2>
                        </div>
                    </div>
                    <div class="linediv"></div>
                </div>

                <div class="box_btns">
                    <button><a href="facturacion.html">Facturación</a></button>
  
                    <div class="btn_count_box">
                        <button><a href="facturas-generadas.html">Facturas Generadas</a></button>
                        <div class="facturas-count-box">
                            <div class="facturas-count" id="facturasCountPendiente">0</div>
                            <div class="facturas-count" id="facturasCountPagado">0</div>
                            <div class="facturas-count" id="facturasCountPagadoListo">0</div>
                        </div>
                    </div>

                    <button><a href="caja.html">Caja/Cuadre</a></button>
                    
                    <!-- Botones solo para admin -->
                     <button class="admin-only"><a href="inventario.html">Inventario</a></button>
                     <button class="admin-only"><a href="contabilidad.html">contabilidad</a></button>
                    <button class="admin-only"><a href="admin.html">Admin</a></button>
                </div>

                <div class="BarraMenu_Right">
                    <div class="Box_Hora">
                        <div class="linediv" style="margin: 0px 15px 0px 12px;"></div>
                        <div id="dateTime">
                            <h1 id="time">--:--:--</h1>
                            <p id="date">--/--/----</p>
                        </div>
                    </div>

                    <div class="Box_LogOut">
                        <div class="linediv" style="margin: 0px 5px 0px 12px;"></div>
                        <button title="Cerrar sesión" id="logout1"><img src="./img/icon/logout.png" alt="Logout"><a href="login.html"></a></button>
                    </div>
                </div>

                <div id="Box_open_Menu_RWD" style="cursor: pointer;">
                    <img src="./img/icon/menu1.png" alt="Menu">
                </div>

                <div id="modal_Menu_RWD" class="modal_Menu_RWD">
                    <div class="modal_content_Menu">
                        <div class="modal_menu_tittle">
                            <span class="close_btn">&times;</span>
                            <h2>Menú</h2>
                        </div>

                        <div class="modal_menu_body">
                            <div class="box_btns_Menu_RWD">
                                <button><a href="facturacion.html">Facturación</a></button>
                                <button><a href="facturas-generadas.html">Facturas Generadas</a></button>
                                <button><a href="caja.html">Caja/Cuadre</a></button>
                                <!-- Botones solo para admin -->
                                <button class="admin-only"><a href="inventario.html">Inventario</a></button>
                                <button class="admin-only"><a href="contabilidad.html">contabilidad</a></button>
                                <button class="admin-only"><a href="admin.html">Admin</a></button>
                            </div>
                        </div>

                        <div class="modal_menu_down">
                            <footer-content></footer-content>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.currentUserRole = null;
        this.logoutTimer = null;
        this.initAuth();
        this.initModal();
        this.resaltarEnlaceActivo();
        this.startDateTimeUpdate();
        this.loadFacturasCount();
        this.setupActivityListeners();
    }

    setupActivityListeners() {
        // Eventos que indican actividad del usuario
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, this.resetLogoutTimer.bind(this), true);
        });

        // Iniciar el temporizador
        this.resetLogoutTimer();
    }

    resetLogoutTimer() {
        // Limpiar el temporizador existente
        if (this.logoutTimer) {
            clearTimeout(this.logoutTimer);
        }
        
        // Establecer nuevo temporizador (1 hora = 3600000 ms)
        this.logoutTimer = setTimeout(() => {
            this.cleanAuthAndRedirect();
        }, 3600000); // 1 hora en milisegundos
    }

    async initAuth() {
        // Ocultar MasterBox0 y el menú completamente
        const masterBox = document.querySelector('.MasterBox0');
        if (masterBox) masterBox.style.display = 'none';
        this.style.display = 'none';
        
        // Verificar caché primero para experiencia más rápida
        const cachedUser = localStorage.getItem('authUser');
        const cachedRole = localStorage.getItem('userRole');
        
        if (cachedUser && cachedRole) {
            this.currentUserRole = cachedRole;
            this.finalizeAuthProcess();
        }
        
        // Observador de autenticación
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                await this.checkUserRole(user.uid);
                this.finalizeAuthProcess();
            } else {
                this.handleUnauthenticated();
            }
        });
    }

    async checkUserRole(uid) {
        try {
            const userDoc = await db.collection('users').doc(uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                this.currentUserRole = userData.role;
                
                // Actualizar caché
                localStorage.setItem('authUser', uid);
                localStorage.setItem('userRole', this.currentUserRole);
                
                this.verifyPageAccess();
                this.adjustMenuForRole();
            } else {
                throw new Error("Documento de usuario no encontrado");
            }
        } catch (error) {
            console.error("Error verificando rol:", error);
            this.cleanAuthAndRedirect();
        }
    }

    finalizeAuthProcess() {
        // Asegurar que el menú se ajuste al rol ANTES de mostrar
        this.adjustMenuForRole();
        
        // Mostrar elementos solo después de toda la validación
        const masterBox = document.querySelector('.MasterBox0');
        if (masterBox) masterBox.style.display = 'block';
        this.style.display = 'block';
        
        this.setupLogout();
    }

    verifyPageAccess() {
        const currentPage = window.location.pathname.split("/").pop();
        const adminPages = ['inventario.html', 'contabilidad.html', 'admin.html'];
        const employeePages = ['facturacion.html', 'facturas-generadas.html', 'caja.html'];
        
        if (currentPage !== 'login.html') {
            localStorage.setItem('lastAttemptedPage', currentPage);
        }
        
        if (this.currentUserRole === 'employee' && adminPages.includes(currentPage)) {
            window.location.href = 'facturacion.html';
        } else if (!adminPages.concat(employeePages).includes(currentPage)) {
            window.location.href = this.currentUserRole === 'admin' ? 'admin.html' : 'facturacion.html';
        }
    }

    adjustMenuForRole() {
        const adminElements = this.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = this.currentUserRole === 'admin' ? 'block' : 'none';
        });
    }

    handleUnauthenticated() {
        const currentPage = window.location.pathname.split("/").pop();
        if (currentPage !== 'login.html') {
            localStorage.setItem('lastAttemptedPage', currentPage);
        }
        
        localStorage.removeItem('authUser');
        localStorage.removeItem('userRole');
        
        window.location.href = 'login.html';
    }

    cleanAuthAndRedirect() {
        // Limpiar el temporizador
        if (this.logoutTimer) {
            clearTimeout(this.logoutTimer);
        }
        
        // Limpiar caché y cerrar sesión
        localStorage.removeItem('authUser');
        localStorage.removeItem('userRole');
        auth.signOut().then(() => {
            window.location.href = 'login.html';
        });
    }

    setupLogout() {
        const logoutBtn = this.querySelector('#logout1');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.cleanAuthAndRedirect();
            });
        }
    }

    loadFacturasCount() {
        this.unsubscribePendiente = db.collection('facturas')
            .where('status', '==', 'pago pendiente')
            .onSnapshot((snapshot) => {
                const count = snapshot.size;
                this.updateDisplay('facturasCountPendiente', count);
            }, (error) => {
                console.error("Error al obtener las facturas en 'pago pendiente': ", error);
                document.getElementById('facturasCountPendiente').textContent = `Error`;
            });

        this.unsubscribePagado = db.collection('facturas')
            .where('status', '==', 'pagado')
            .onSnapshot((snapshot) => {
                const count = snapshot.size;
                this.updateDisplay('facturasCountPagado', count);
            }, (error) => {
                console.error("Error al obtener las facturas en 'pagado': ", error);
                document.getElementById('facturasCountPagado').textContent = `Error`;
            });

        this.unsubscribePagadoListo = db.collection('facturas')
            .where('status', '==', 'pagado listo')
            .onSnapshot((snapshot) => {
                const count = snapshot.size;
                this.updateDisplay('facturasCountPagadoListo', count);
            }, (error) => {
                console.error("Error al obtener las facturas en 'pagado listo': ", error);
                document.getElementById('facturasCountPagadoListo').textContent = `Error`;
            });
    }

    updateDisplay(elementId, count) {
        const element = document.getElementById(elementId);
        element.textContent = count;
        if (count > 0) {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
        
        const dupElement = document.getElementById(elementId + 'Dup');
        if (dupElement) {
            dupElement.textContent = count;
            if (count > 0) {
                dupElement.style.display = 'block';
            } else {
                dupElement.style.display = 'none';
            }
        }
    }

    initModal() {
        const openMenuButton = this.querySelector("#Box_open_Menu_RWD");
        const modal = this.querySelector("#modal_Menu_RWD");
        const closeButton = this.querySelector(".close_btn");
        const modalContent = this.querySelector(".modal_content_Menu");
    
        openMenuButton.onclick = () => {
            modal.style.display = "block";
            modal.style.animation = "slideIn 0.2s forwards";
            modalContent.style.animation = "contentFadeIn 0.2s forwards";
            document.body.classList.add('no-scroll');
        };
    
        closeButton.onclick = () => {
            this.closeModal(modal, modalContent);
        };
    
        modal.onclick = (event) => {
            if (event.target === modal) {
                this.closeModal(modal, modalContent);
            }
        };
    }
    
    closeModal(modal, modalContent) {
        modalContent.style.animation = "contentFadeOut 0.2s forwards";
        modal.style.animation = "slideOut 0.2s forwards";
        setTimeout(() => {
            modal.style.display = "none";
            document.body.classList.remove('no-scroll');
        }, 500);
    }

    resaltarEnlaceActivo() {
        const currentPage = window.location.pathname.split("/").pop();
        const buttons = this.querySelectorAll('.box_btns button a, .box_btns_Menu_RWD button a');

        buttons.forEach(button => {
            const href = button.getAttribute('href');
            if (href === currentPage) {
                button.classList.add('active');
            }
        });
    }

    startDateTimeUpdate() {
        const updateDateTime = () => {
            const now = new Date();
            let hours = now.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const minutes = now.getMinutes().toString().padStart(2, "0");
            const seconds = now.getSeconds().toString().padStart(2, "0");
            const timeString = `${hours}:${minutes}:${seconds} ${ampm}`;

            const day = now.getDate().toString().padStart(2, "0");
            const month = (now.getMonth() + 1).toString().padStart(2, "0");
            const year = now.getFullYear();
            const dateString = `${day}/${month}/${year}`;

            document.getElementById("time").textContent = timeString;
            document.getElementById("date").textContent = dateString;
        };

        setInterval(updateDateTime, 1000);
        updateDateTime();
    }

    javascript
updateFooterYear() {
    try {
        const currentYear = new Date().getFullYear();
        const yearElements = document.querySelectorAll('#currentYear, #currentYearMobile');
        
        if (yearElements.length === 0) {
            console.warn('No se encontraron elementos para mostrar el año');
            return;
        }
        
        yearElements.forEach(el => {
            el.textContent = currentYear;
        });
    } catch (error) {
        console.error('Error al actualizar el año en el footer:', error);
    }
}

    disconnectedCallback() {
        if (this.unsubscribePendiente) {
            this.unsubscribePendiente();
        }
        if (this.unsubscribePagado) {
            this.unsubscribePagado();
        }
        if (this.unsubscribePagadoListo) {
            this.unsubscribePagadoListo();
        }
        
        // Limpiar listeners de actividad
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            document.removeEventListener(event, this.resetLogoutTimer, true);
        });
        
        // Limpiar temporizador
        if (this.logoutTimer) {
            clearTimeout(this.logoutTimer);
        }
    }
}


customElements.define('laundry-menu', LaundryMenu);

class FooterContent extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <style>
                #creditos {
                   width: 100%;
                }
                #creditos p {
                  text-align: center;
                  font-size: 14px;
                  color: #000000;
                }
            </style>
            <div id="creditos"><p>© Developed by J.P.</p></div>
        `;
    }
}

customElements.define('footer-content', FooterContent);


