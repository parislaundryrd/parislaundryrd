class LaundryMenu extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <style>
                /* Aquí puedes agregar estilos si es necesario */

            </style>

            <div class="BarraMenu">
                <div class="BarraMenu_Left">
                    <div class="menu_tittle">
                        <img src="./img/Paris Laundry 1.png" alt="Logo">
                        <h1>Paris Laundry</h1>
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
                            <!-- Duplicados -->

                        </div>
                    </div>

                    <button><a href="caja.html">Caja/Cuadre</a></button>
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
                                <button><a href="facturacion.html">Facturación</a></button>
                                <button><a href="facturas-generadas.html">Facturas Generadas</a></button>
                                <button><a href="caja.html">Caja/Cuadre</a></button>
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
        this.startDateTimeUpdate(); // Iniciar la actualización de fecha y hora
        this.loadFacturasCount(); // Cargar el conteo de facturas
    }

    loadFacturasCount() {
        // Inicializa Firebase (asegúrate de que ya has configurado Firebase en tu proyecto)
        const db = firebase.firestore();

        // Escuchar cambios en tiempo real para "pago pendiente"
        this.unsubscribePendiente = db.collection('facturas')
            .where('status', '==', 'pago pendiente')
            .onSnapshot((snapshot) => {
                const count = snapshot.size; // Obtiene el número de documentos que cumplen con la condición
                this.updateDisplay('facturasCountPendiente', count);
                this.updateDisplay('facturasCountPendienteDup', count); // Actualiza el duplicado
            }, (error) => {
                console.error("Error al obtener las facturas en 'pago pendiente': ", error);
                document.getElementById('facturasCountPendiente').textContent = `Error al cargar facturas`;
                document.getElementById('facturasCountPendienteDup').textContent = `Error al cargar facturas`; // Error en duplicado
            });

        // Escuchar cambios en tiempo real para "pagado"
        this.unsubscribePagado = db.collection('facturas')
            .where('status', '==', 'pagado')
            .onSnapshot((snapshot) => {
                const count = snapshot.size; // Obtiene el número de documentos que cumplen con la condición
                this.updateDisplay('facturasCountPagado', count);
                this.updateDisplay('facturasCountPagadoDup', count); // Actualiza el duplicado
            }, (error) => {
                console.error("Error al obtener las facturas en 'pagado': ", error);
                document.getElementById('facturasCountPagado').textContent = `Error al cargar facturas`;
                document.getElementById('facturasCountPagadoDup').textContent = `Error al cargar facturas`; // Error en duplicado
            });

        // Escuchar cambios en tiempo real para "pagado listo"
        this.unsubscribePagadoListo = db.collection('facturas')
            .where('status', '==', 'pagado listo')
            .onSnapshot((snapshot) => {
                const count = snapshot.size; // Obtiene el número de documentos que cumplen con la condición
                this.updateDisplay('facturasCountPagadoListo', count);
                this.updateDisplay('facturasCountPagadoListoDup', count); // Actualiza el duplicado
            }, (error) => {
                console.error("Error al obtener las facturas en 'pagado listo': ", error);
                document.getElementById('facturasCountPagadoListo').textContent = `Error al cargar facturas`;
                document.getElementById('facturasCountPagadoListoDup').textContent = `Error al cargar facturas`; // Error en duplicado
            });
    }

    updateDisplay(elementId, count) {
        const element = document.getElementById(elementId);
        element.textContent = count; // Solo mostrar el número
        if (count > 0) {
            element.style.display = 'block'; // Mostrar el div si el conteo es mayor que 0
        } else {
            element.style.display = 'none'; // Ocultar el div si el conteo es 0
        }
    }

    initModal() {
        const openMenuButton = this.querySelector("#Box_open_Menu_RWD");
        const modal = this.querySelector("#modal_Menu_RWD");
        const closeButton = this.querySelector(".close_btn");
        const modalContent = this.querySelector(".modal_content_Menu");
    
        openMenuButton.onclick = () => {
            modal.style.display = "block";
            modal.style.animation = "slideIn 0.2s forwards"; // Animación de entrada del modal
            modalContent.style.animation = "contentFadeIn 0.2s forwards"; // Animación de entrada del contenido
            document.body.classList.add('no-scroll'); // Deshabilitar scroll
        };
    
        closeButton.onclick = () => {
            this.closeModal(modal, modalContent);
        };
    
        // Cerrar el modal al hacer clic en cualquier parte del modal
        modal.onclick = (event) => {
            if (event.target === modal) {
                this.closeModal(modal, modalContent);
            }
        };
    }
    
    closeModal(modal, modalContent) {
        modalContent.style.animation = "contentFadeOut 0.2s forwards"; // Animación de salida del contenido
        modal.style.animation = "slideOut 0.2s forwards"; // Animación de salida del modal
        setTimeout(() => {
            modal.style.display = "none"; // Ocultar modal después de la animación
            document.body.classList.remove('no-scroll'); // Habilitar scroll
        }, 500); // Esperar a que termine la animación
    }

    resaltarEnlaceActivo() {
        const currentPage = window.location.pathname.split("/").pop(); // Obtiene el nombre del archivo actual
        const buttons = this.querySelectorAll('.box_btns button a, .box_btns_Menu_RWD button a');

        buttons.forEach(button => {
            const href = button.getAttribute('href');
            if (href === currentPage) {
                button.classList.add('active'); // Agrega la clase 'active' al enlace correspondiente
            }
        });
    }

    startDateTimeUpdate() {
        const updateDateTime = () => {
            const now = new Date();

            // Formatear hora en formato de 12 horas
            let hours = now.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // La hora 0 debería ser 12
            const minutes = now.getMinutes().toString().padStart(2, "0");
            const seconds = now.getSeconds().toString().padStart(2, "0");
            const timeString = `${hours}:${minutes}:${seconds} ${ampm}`;

            // Formatear fecha
            const day = now.getDate().toString().padStart(2, "0");
            const month = (now.getMonth() + 1).toString().padStart(2, "0"); // Los meses comienzan desde 0
            const year = now.getFullYear();
            const dateString = `${day}/${month}/${year}`;

            // Actualizar DOM
            document.getElementById("time").textContent = timeString;
            document.getElementById("date").textContent = dateString;
        };

        // Actualizar cada segundo
        setInterval(updateDateTime, 1000);
        updateDateTime(); // Llamada inicial
    }

    disconnectedCallback() {
        // Desuscribirse de los listeners cuando el componente se destruye
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
