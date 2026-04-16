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
                        <h2>ALMA ROSA</h2>
                        </div>
                    </div>
                    <div class="linediv"></div>
                </div>

                <div class="box_btns">
                    <button><a href="facturacion.html">Facturación</a></button>
  
                    <div class="btn_count_box">
                        <button><a href="facturas-generadas.html">Facturas Generadas</a></button>
                        <div class="facturas-count-box">
                            <div class="facturas-count facturas-count--pendiente" id="facturasCountPendiente" title="Pagos Pendientes"><span id="facturasCountPendienteNum">0</span></div>
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
                            <div id="internetIndicador" class="internet-indicador">
                                <span id="internetIcono" class="internet-icono">
                                    <svg id="internetSvg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                                    </svg>
                                </span>
                                <span id="internetTexto">Verificando…</span>
                            </div>
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
        this.initAuth();
        this.initModal();
        this.resaltarEnlaceActivo();
        this.startDateTimeUpdate();
        this.initInternetIndicator();
        // CORRECCIÓN: loadFacturasCount() se llama desde finalizeAuthProcess()
        // para garantizar que Firebase Auth ya confirmó sesión antes de hacer queries.
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

        // CORRECCIÓN: Iniciar contadores AQUÍ, cuando Auth ya confirmó sesión.
        // La bandera evita suscribirse dos veces (caché + onAuthStateChanged).
        if (!this._contadoresIniciados) {
            this._contadoresIniciados = true;
            this.loadFacturasCount();
        }
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
        // Contador de pagos pendientes desde la colección dedicada "facturas-pendiente"
        this.unsubscribePendiente = db.collection('facturas-pendiente')
            .onSnapshot((snapshot) => {
                this.updateDisplay('facturasCountPendiente', snapshot.size);
            }, (error) => {
                console.error("Error al obtener contadores de pendientes:", error);
            });

        // Contadores de pagado / pagado listo desde "facturas-por-dia"
        this.unsubscribeFacturasCount = db.collection('facturas-por-dia')
            .onSnapshot((snapshot) => {
                let pagado = 0, pagadoListo = 0;

                const rdNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Santo_Domingo' }));
                const hoy = `${rdNow.getFullYear()}-${String(rdNow.getMonth()+1).padStart(2,'0')}-${String(rdNow.getDate()).padStart(2,'0')}`;

                snapshot.forEach(doc => {
                    const data = doc.data();
                    const docFecha = data.fechaString || doc.id;
                    if (docFecha > hoy) return;

                    (data.facturas || []).forEach(f => {
                        if (f._diaOriginal) return;
                        if (f.status === 'pagado') pagado++;
                        else if (f.status === 'pagado listo') pagadoListo++;
                    });
                });

                this.updateDisplay('facturasCountPagado', pagado);
                this.updateDisplay('facturasCountPagadoListo', pagadoListo);
            }, (error) => {
                console.error("Error al obtener contadores de facturas:", error);
            });
    }

    updateDisplay(elementId, count) {
        const element = this.querySelector('#' + elementId);
        if (element) {
            // Para el contador de pendientes, actualizar el span interno
            if (elementId === 'facturasCountPendiente') {
                const numSpan = this.querySelector('#facturasCountPendienteNum');
                if (numSpan) numSpan.textContent = count;
                element.style.display = count > 0 ? 'inline-flex' : 'none';
            } else {
                element.textContent = count;
                element.style.display = count > 0 ? 'block' : 'none';
            }
        }

        const dupElement = document.getElementById(elementId + 'Dup');
        if (dupElement) {
            dupElement.textContent = count;
            dupElement.style.display = count > 0 ? 'inline' : 'none';
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

    initInternetIndicator() {
        const ind = this.querySelector('#internetIndicador');
        const icono = this.querySelector('#internetSvg');
        const texto = this.querySelector('#internetTexto');
        if (!ind) return;

        const setOnline = () => {
            ind.dataset.state = 'online';
            icono.innerHTML = '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>';
            texto.textContent = 'Conectado';
        };

        const setOffline = () => {
            ind.dataset.state = 'offline';
            icono.innerHTML = '<circle cx="12" cy="12" r="10" opacity="0.35"/><path d="M2 12h20" opacity="0.35"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" opacity="0.35"/><line x1="4" y1="4" x2="20" y2="20"/>';
            texto.textContent = 'Sin conexión';
        };

        const checkConnection = () => {
            if (!navigator.onLine) { setOffline(); return; }
            const img = new Image();
            const timer = setTimeout(() => { img.src = ''; setOffline(); }, 4000);
            img.onload = () => { clearTimeout(timer); setOnline(); };
            img.onerror = () => { clearTimeout(timer); setOnline(); }; // error CORS = hay red
            img.src = `https://www.google.com/favicon.ico?_=${Date.now()}`;
        };

        window.addEventListener('online', checkConnection);
        window.addEventListener('offline', setOffline);
        checkConnection();
        setInterval(checkConnection, 15000);
    }

    disconnectedCallback() {
        if (this.unsubscribePendiente) this.unsubscribePendiente();
        if (this.unsubscribeFacturasCount) this.unsubscribeFacturasCount();
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