// src/plugins/google-maps.js

export function loadGoogleMapsApi(apiKey) {
    return new Promise((resolve, reject) => {
        if (!apiKey) {
            reject(new Error('API key is missing.'));
            return;
        }

        if (window.google && window.google.maps) {
            resolve(window.google.maps);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google.maps);
        script.onerror = (error) => reject(error);

        document.head.appendChild(script);
    });
}
