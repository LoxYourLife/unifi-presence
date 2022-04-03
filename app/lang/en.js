export default {
  COMMON: {
    SAVE_BTN: 'Save',
    SAVE_AND_LOGIN_BTN: 'Save and Login',
    VERSION_ERROR:
      'The version of your unifi controller is lower than 6.4.54. Please update your controller to be able to use the plugin. Your current version is: {version}'
  },
  UNIFI: {
    SETTINGS: 'Settings',
    DEVICES: 'Devices',
    PLUGIN_SETTINGS: 'Plugin Settings',
    CONTROLLER: 'UniFi Controller Settings',
    TOPIC: 'MQTT Topic',
    TOPIC_HINT:
      "Specify the topic you'd like the data to be published. eg. UniFi/clients. No slash in the beginning or the end. Subscription is added automatically.",
    IP: 'IP Address',
    IP_HINT: 'Please enter the local IP of your UniFi controller and ensure that Loxberry has access.',
    USERNAME: 'Username',
    PASSWORD: 'Password',
    SITE: 'UniFi Site',
    NEED_MQTT: 'To use this plugin, the MQTT Gateway plugin is required. Please install the MQTT Gateway Plugin version >= 2.0.4 first.',
    CLIENTS: 'UniFi Devices',
    // NO_CLIENTS: 'Geräte konnen noch nicht angezeigt werden. Bitte stelle zunächst eine Verbindung zum UniFi Controller her.',
    CLIENT_SELECTION:
      'All clients which are selected are watched and transmitted to MQTT. All other clients are ignored. To get the state of one or more elements, simply select them. The selection is saved automatically.',
    NAME: 'Name',
    MAC: 'Mac Address',
    SSID: 'WLAN SSID',
    EXPERIENCE: 'Experience / Signal',
    TYPE: 'Type',
    TWO_FA: 'Please enter your 2FA code to login.',
    NATIVE_HINT:
      'If you use a UniFi Dream Machine oder Dream Machine Pro, please tick this with yes. If your controller runs somewhere else please leave that unchecked.',
    PORT: 'UniFi port to acces the control panel',
    PORT_HINT: 'If you do need a port to access the control panel via browser, please specifiy this port here.',
    LOGIN_REQUIRED: 'Logged out, Please login again.',
    VERSION: 'Version {version}',
    CPU: 'CPU',
    MEMORY: 'Mem',
    UPTIME: 'Active',
    ISP: 'ISP',
    SHOW_WIRED: 'Show wired',
    SHOW_WIFI: 'Show WiFi',
    SHOW_OFFLINE: 'Show Offline',
    SORT: 'Sorting',
    SEARCH: 'Search',
    ANDROID_DEVICES:
      "Looks like you have android devices in your list. Android seems to use a random mac address while connecting to WiFi. When this feature is active, the plugin can't identify the device properly and detect the state. You'd need to disable this feature.",
    ANDROID_DEVICE_LINK: 'Hint to decativate',
    TIMEOUT_OPTIONS: 'Timeout for wired devices',
    TIMEOUT_OPTIONS_HINT:
      "UniFi can't detect if a wired is online or offline. When a wired device doen't send data in the given time window, the device will be shown as offline. Suddenly it happen's that a device doesn't send data for a minute or so and will then be shown as offline even though it might be online."
  },
  SERVICE: {
    WAIT_FOR_CONFIG: 'Configuration issue, waiting for changes',
    CONNECTED: 'Connected to UniFi Controller',
    DISCONNECTED: 'Not connected - Trying to reconnect',
    UNAUTHORIZED: 'Logged out',
    LOST: 'UniFi Event Service not reachable',
    RESTART: 'Restart Backround Service',
    NO_MQTT: 'Mqtt Plugin is not installed'
  },

  SORTING: {
    STANDARD: 'Standard',
    SELECTED: 'Selected',
    NAME: 'Name',
    SSID: 'WiFi SSID',
    EXPERIENCE: 'Experience',
    TYPE: 'Type'
  },

  VALIDATION: {
    REQUIRED: 'This field is required.',
    INVALID_TOPIC: 'A topic can only be alphanumeric and separated by /. e.g. test/topic',
    INVALID_IP: 'Plase enter a valid ip-v4.',
    INVALID_PORT: 'Please enter a port between 0 and 65535.'
  },

  TIMEOUT_OPTIONS: {
    SECONDS: '{count} Seconds',
    MINUTES: '{count} Minute | {count} Minutes'
  }
};
