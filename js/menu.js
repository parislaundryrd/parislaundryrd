class LaundryMenu extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <style>
           
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
                            <p id="date">Cargando fecha...</p>
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
    }

    initModal() {
        const openMenuButton = this.querySelector("#Box_open_Menu_RWD");
        const modal = this.querySelector("#modal_Menu_RWD");
        const closeButton = this.querySelector(".close_btn");

        openMenuButton.onclick = () => {
            modal.style.display = "block";
            modal.style.animation = "slideIn 0.2s forwards"; // Aplicar animación de entrada
        };

        closeButton.onclick = () => {
            modal.style.animation = "slideOut 0.2s forwards"; // Aplicar animación de salida
            setTimeout(() => {
                modal.style.display = "none"; // Ocultar modal después de la animación
            }, 500); // Esperar a que termine la animación
        };
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
}

customElements.define('laundry-menu', LaundryMenu);