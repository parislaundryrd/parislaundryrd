// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDdG-CP2kO3v-zkkjD17Wj028QJvjp54qY",
    authDomain: "paris-laundry.firebaseapp.com",
    projectId: "paris-laundry",
    storageBucket: "paris-laundry.firebasestorage.app",
    messagingSenderId: "1022712814457",
    appId: "1:1022712814457:web:7bddb47ed46bac22c32da8"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Configurar auth y db en el objeto window
window.auth = firebase.auth();
window.db = firebase.firestore();