class LaundryMenu extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <style>
                .connection-status {
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    padding: 10px 20px;
                    border-radius: 5px;
                    font-weight: bold;
                    z-index: 1000;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    display: none;
                    animation: fadeIn 0.15s ease-out;
                }
                .offline {
                    background-color: #ffebee;
                    color: #c62828;
                    border: 1px solid #c62828;
                }
                .online {
                    background-color: #e8f5e9;
                    color: #2e7d32;
                    border: 1px solid #2e7d32;
                    animation: fadeInOut 5s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; top: 10px; }
                    to { opacity: 1; top: 20px; }
                }
                @keyframes fadeInOut {
                    0% { opacity: 0; top: 10px; }
                    10% { opacity: 1; top: 20px; }
                    90% { opacity: 1; top: 20px; }
                    100% { opacity: 0; top: 10px; }
                }
            </style>
            <div class="connection-status" id="connectionStatus"></div>
            <div class="BarraMenu">
                <div class="BarraMenu_Left">
                    <div class="menu_tittle">
                        <img src="./img/Paris Laundry 1.png" alt="Logo">
                        <h1>Paris Laundry</h1>
                    </div>
                    <div class="linediv"></div>
                </div>

                <div class="box_btns">
                    <button><a href="facturacion-admin.html">Facturación</a></button>
  
                    <div class="btn_count_box">
                        <button><a href="facturas-generadas-admin.html">Facturas Generadas</a></button>
                        <div class="facturas-count-box">
                            <div class="facturas-count" id="facturasCountPendiente">0</div>
                            <div class="facturas-count" id="facturasCountPagado">0</div>
                            <div class="facturas-count" id="facturasCountPagadoListo">0</div>
                        </div>
                    </div>

                    <button><a href="caja-admin.html">Caja/Cuadre</a></button>
                    <button><a href="inventario.html">Inventario</a></button>
                    <button><a href="contabilidad.html">Contabilidad</a></button>
                    <button><a href="admin.html">Admin</a></button>
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
                        <button id="logout1"><img src="./img/icon/logout.png" alt="Logout"><a href="index.html"></a></button>
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
                                <button><a href="facturacion-admin.html">Facturación</a></button>
                                <button><a href="facturas-generadas-admin.html">Facturas Generadas</a></button>
                                <button><a href="caja-admin.html">Caja/Cuadre</a></button>
                                <button><a href="inventario.html">Inventario</a></button>
                                <button><a href="contabilidad.html">Contabilidad</a></button>
                                <button><a href="admin.html">Admin</a></button>
                            </div>
                        </div>

                        <div class="modal_menu_down">
                            <footer-content></footer-content>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.initModal();
        this.resaltarEnlaceActivo();
        this.startDateTimeUpdate();
        this.loadFacturasCount();
        this.setupConnectionMonitor();
    }

    setupConnectionMonitor() {
        this.connectionStatus = document.getElementById('connectionStatus');
        this.wasOffline = false;
        
        window.addEventListener('online', this.handleOnline.bind(this), {passive: true});
        window.addEventListener('offline', this.handleOffline.bind(this), {passive: true});
        
        if (!navigator.onLine) {
            this.wasOffline = true;
            this.showConnectionStatus('offline');
        }
    }

    handleOnline() {
        if (this.wasOffline) {
            this.showConnectionStatus('online');
            this.wasOffline = false;
        }
    }

    handleOffline() {
        this.wasOffline = true;
        this.showConnectionStatus('offline');
    }

    showConnectionStatus(status) {
        this.connectionStatus.textContent = status === 'online' 
            ? 'Nuevamente en línea' 
            : 'Sin conexión';
        
        this.connectionStatus.className = `connection-status ${status}`;
        this.connectionStatus.style.display = 'block';
        
        if (status === 'online') {
            setTimeout(() => {
                this.connectionStatus.style.display = 'none';
            }, 5000);
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

    loadFacturasCount() {
        const db = firebase.firestore();

        this.unsubscribePendiente = db.collection('facturas')
            .where('status', '==', 'pago pendiente')
            .onSnapshot((snapshot) => {
                const count = snapshot.size;
                this.updateDisplay('facturasCountPendiente', count);
            }, (error) => {
                console.error("Error al obtener las facturas en 'pago pendiente': ", error);
                document.getElementById('facturasCountPendiente').textContent = 'Error';
            });

        this.unsubscribePagado = db.collection('facturas')
            .where('status', '==', 'pagado')
            .onSnapshot((snapshot) => {
                const count = snapshot.size;
                this.updateDisplay('facturasCountPagado', count);
            }, (error) => {
                console.error("Error al obtener las facturas en 'pagado': ", error);
                document.getElementById('facturasCountPagado').textContent = 'Error';
            });

        this.unsubscribePagadoListo = db.collection('facturas')
            .where('status', '==', 'pagado listo')
            .onSnapshot((snapshot) => {
                const count = snapshot.size;
                this.updateDisplay('facturasCountPagadoListo', count);
            }, (error) => {
                console.error("Error al obtener las facturas en 'pagado listo': ", error);
                document.getElementById('facturasCountPagadoListo').textContent = 'Error';
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