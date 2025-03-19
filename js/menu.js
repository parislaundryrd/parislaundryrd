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
                        <img src="./img/icon/logo-premium.png" alt="Logo">
                        <h1>Laundry Premium</h1>
                    </div>
                    <div class="linediv"></div>
                </div>

                <div class="box_btns">
                    <button><a href="1.html">Facturación</a></button>
                    <button><a href="2.html">Facturas Generadas</a></button>
                    <button><a href="3.html">Caja/Cuadre</a></button>
                    <button><a href="4.html">Inventario</a></button>
                    <button><a href="5.html">Contabilidad</a></button>
                    <button><a href="6.html">Admin</a></button>
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
                                <button><a href="1.html">Facturación</a></button>
                                <button><a href="2.html">Facturas Generadas</a></button>
                                <button><a href="3.html">Caja/Cuadre</a></button>
                                <button><a href="4.html">Inventario</a></button>
                                <button><a href="5.html">Contabilidad</a></button>
                                <button><a href="6.html">Admin</a></button>
                            </div>
                        </div>

                        <div class="modal_menu_down">
                            <p>© Paris Laundry RD</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.initModal();
        this.resaltarEnlaceActivo();
        this.startDateTimeUpdate(); // Iniciar la actualización de fecha y hora
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
}

customElements.define('laundry-menu', LaundryMenu);
