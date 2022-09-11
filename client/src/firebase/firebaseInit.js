import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyASIfud0BtSI6iLdQr1JX_ZDgLQubiJIpQ',
    authDomain: 'eliza-a87cf.firebaseapp.com',
    projectId: 'eliza-a87cf',
    storageBucket: 'eliza-a87cf.appspot.com',
    messagingSenderId: '21692781869',
    appId: '1:21692781869:web:5be8ae7656100d945e6fa4'
};


initializeApp(firebaseConfig);
// enableIndexedDbPersistence(getFirestore())
//     .catch((err) => {
//         if (err.code == 'failed-precondition') {
//             console.log('failed failed-precondition')
//         } else if (err.code == 'unimplemented') {
//             console.log('failed unimplemented')
//         }
//     })