export default {
  COMMON: {
    SAVE_BTN: 'Speichern',
    SAVE_AND_LOGIN_BTN: 'Speichern und Einloggen',
    VERSION_ERROR:
      'Die Version deines UniFi Controller ist kleiner als 6.4.54. Bitte aktualisiere zuerst deinen Controller um das Plugin nutzen zu können. Deine aktuelle Version ist: {version}'
  },
  UNIFI: {
    SETTINGS: 'Einstellungen',
    DEVICES: 'Geräte',
    MQTT_SETTINGS: 'MQTT Einstellungen',
    CONTROLLER: 'UniFi Controller Einstellungen',
    TOPIC: 'MQTT Topic',
    TOPIC_HINT:
      'Das Mqtt Topic in dem die Werte geschrieben werden sollen. Z.B. UniFi/clients. Kein Slash am Anfang oder Ende und keine Leer- oder Sonderzeichen',
    IP: 'IP Adresse',
    IP_HINT: 'Gebe hier die IP Adresse des UniFi Controllers an. Stelle Sicher, dass Loxberry zugriff darauf hat.',
    USERNAME: 'Benutzername',
    PASSWORD: 'Passwort',
    SITE: 'UniFi Site',
    NEED_MQTT: 'Um dises Plugin nutzen zu können, muss das MQTT Gateway Plugin in der Version >= 2.0.4 installiert sein.',
    CLIENTS: 'UniFi WiFi Geräte',
    // NO_CLIENTS: 'Geräte konnen noch nicht angezeigt werden. Bitte stelle zunächst eine Verbindung zum UniFi Controller her.',
    CLIENT_SELECTION:
      'Alle selektierten Geräte werden überwacht und an MQTT übermittelt. Alle anderen Geräte werden ignoriert. Um den Status der Geräte zu erhalten, müssen diese Selektiert werden. Es wird automatisch gespeichert.',
    NAME: 'Name',
    MAC: 'Mac Adresse',
    SSID: 'WLAN SSID',
    EXPERIENCE: 'Erfahrung / Signal',
    TYPE: 'Typ',
    TWO_FA: 'Bitte gebe dein 2 Faktor Code ein.',
    NATIVE_HINT:
      'Wenn du eine UniFi Dream Machine oder die Dream Machine Pro benutzt, aktiviere bitte den Schalter. Wenn dein Controller woanders läuft, dann lasse den Schalter bitte aus.',
    PORT: 'Der port um das Dashbaord zu öffnen - sofern benötigt.',
    PORT_HINT: 'Wenn du einen port für den Zugriff auf den Controller im Browser brauchst, dann geben diesen bitte hier an.',
    LOGIN_REQUIRED: 'Ausgeloggt, Bitte neu einloggen.',
    VERSION: 'Version {version}',
    CPU: 'CPU',
    MEMORY: 'Mem',
    UPTIME: 'Aktiv',
    ISP: 'ISP',
    SHOW_WIRED: 'Kabelgebunden anzeigen',
    SHOW_WIFI: 'Wifi anzeigen',
    SHOW_OFFLINE: 'Zeige Offline',
    SORT: 'Sortierung',
    SEARCH: 'Suche',
    ANDROID_DEVICES:
      'Es befinden sich Android Geräte in der Liste. Andoid neigt dazu eine zufällige Mac Adresse zu vergeben. Ist dieses Feature aktiviert, dann kann das Plugin keine eindeutige zuweisung des Gerätes vornehmen und die Erkennung des Gerätes funktioniert nicht. Das müsste dann deaktiviert werden.',
    ANDROID_DEVICE_LINK: 'Hinweise zum Deaktivieren'
  },
  SERVICE: {
    WAIT_FOR_CONFIG: 'Konfigurationsfehler, wartet auf Änderungen',
    CONNECTED: 'Verbunden mit UniFi Controller',
    DISCONNECTED: 'Nicht Verbunden - Neue Verbindung wird hergestellt',
    UNAUTHORIZED: 'Nicht eingeloggt',
    LOST: 'UniFi Event Service nicht erreichbar',
    RESTART: 'Hintergrund Service Neustarten',
    NO_MQTT: 'Mqtt Plugin ist nicht installiert'
  },

  SORTING: {
    STANDARD: 'Standard',
    SELECTED: 'Selectiert',
    NAME: 'Name',
    SSID: 'Wlan SSID',
    EXPERIENCE: 'Erfahrung',
    TYPE: 'Typ'
  },

  VALIDATION: {
    REQUIRED: 'Diese Feld wird zwingend benötigt.',
    INVALID_TOPIC: 'Das Topic darf nur alphanumerisch sein und wird mit einem / gruppiert. Beispielsweise test/topic.',
    INVALID_IP: 'Bitte gebe eine gültige V4 IP-Addresse ein.',
    INVALID_PORT: 'Bitte gebe einen Port zwischen 0 und 65535 an.'
  }
};
