document.getElementById("billing-form").addEventListener("submit", (e) => {
    e.preventDefault();

    // Capturar datos del formulario
    const customerName = document.getElementById("customer-name").value;
    const customerPhone = document.getElementById("customer-phone").value;
    const serviceType = document.getElementById("service-type").value;
    const deliveryOption = document.getElementById("delivery-option").value;
    const estimatedTime = document.getElementById("estimated-time").value;

    // Productos adicionales seleccionados
    const extras = Array.from(document.querySelectorAll("#extras input:checked"))
        .map((input) => input.value);

    // Datos para guardar en Firestore
    const invoice = {
        customerName,
        customerPhone,
        serviceType,
        deliveryOption,
        extras,
        estimatedTime,
        date: new Date(),
    };

    // Guardar factura en Firestore
    db.collection("invoices")
        .add(invoice)
        .then(() => {
            alert("Factura generada exitosamente");
            document.getElementById("billing-form").reset();
        })
        .catch((error) => {
            console.error("Error al guardar la factura: ", error);
        });
});
