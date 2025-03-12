let currentYear = new Date().getFullYear(); // Año actual
const yearSelect = document.getElementById('yearSelect');
let chart; // Variable para almacenar la instancia del gráfico

// Función para cargar los años disponibles
const loadYears = () => {
    db.collection("transacciones").get().then((snapshot) => {
        const years = new Set(); // Usar un Set para evitar duplicados
        snapshot.forEach((doc) => {
            const data = doc.data();
            const year = data.date.toDate().getFullYear();
            years.add(year); // Agregar el año al Set
        });

        // Convertir el Set a un array y ordenarlo
        const sortedYears = Array.from(years).sort((a, b) => b - a);

        // Llenar el select con los años
        sortedYears.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });

        // Establecer el año por defecto como el más reciente
        if (sortedYears.length > 0) {
            currentYear = sortedYears[0]; // El año más reciente
            yearSelect.value = currentYear; // Establecer el valor del select
        }

        // Cargar los datos mensuales para el año por defecto
        loadMonthlyData(currentYear);
    }).catch((error) => {
        console.error("Error al cargar los años: ", error);
    });
};

// Función para cargar los datos mensuales según el año seleccionado
const loadMonthlyData = (year) => {
    const incomeData = new Array(12).fill(0);
    const expenseData = new Array(12).fill(0);

    // Cargar transacciones de la colección "transacciones" para el año seleccionado
    db.collection("transacciones").get().then((snapshot) => {
        snapshot.forEach((doc) => {
            const data = doc.data();
            const transactionDate = data.date.toDate();
            if (transactionDate.getFullYear() === year) {
                const month = transactionDate.getMonth(); // Obtener el mes (0-11)
                if (data.type === "income") {
                    incomeData[month] += data.amount; // Sumar ingresos
                } else if (data.type === "expense") {
                    expenseData[month] += data.amount; // Sumar gastos
                }
            }
        });

        // Cargar pagos de empleados para el año seleccionado
        return db.collection("PagoEmpleado").get();
    }).then((snapshot) => {
        snapshot.forEach((doc) => {
            const data = doc.data();
            const paymentDate = data.date.toDate();
            if (paymentDate.getFullYear() === year) {
                const month = paymentDate.getMonth(); // Obtener el mes (0-11)
                expenseData[month] += data.total; // Sumar gastos de pagos de empleados
            }
        });

        // Cargar facturas para el año seleccionado
        return db.collection("facturas").get();
    }).then((snapshot) => {
        snapshot.forEach((doc) => {
            const data = doc.data();
            const invoiceDate = new Date(data.timestamp);
            if (invoiceDate.getFullYear() === year) {
                const month = invoiceDate.getMonth(); // Obtener el mes (0-11)
                incomeData[month] += data.total; // Sumar ingresos de facturas
            }
        });

        // Llamar a la función para dibujar el gráfico
        drawChart(incomeData, expenseData);
    }).catch((error) => {
        console.error("Error al cargar los datos mensuales: ", error);
    });
};

// Evento para cambiar el año seleccionado
yearSelect.addEventListener('change', (event) => {
    const selectedYear = parseInt(event.target.value);
    loadMonthlyData(selectedYear); // Cargar datos para el año seleccionado
});

// Función para dibujar el gráfico
const drawChart = (incomeData, expenseData) => {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    if (chart) {
        chart.destroy(); // Destruir el gráfico anterior si existe
    }
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            datasets: [
                {
                    label: 'Ingresos',
                    data: incomeData,
                    //backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    backgroundColor: 'rgba(68, 201, 146, 0.6)',
                },
                {
                    label: 'Gastos',
                    data: expenseData,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};

// Llamar a la función para cargar los años disponibles al inicio
loadYears();