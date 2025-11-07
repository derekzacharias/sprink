#include <WiFi.h>
#include <PubSubClient.h>

// Replace with your network credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "192.168.1.100"; // Mosquitto broker

WiFiClient espClient;
PubSubClient client(espClient);

// Map 16 zones to pins (adjust to your relay board)
const uint8_t ZONE_PINS[16] = { 13, 12, 14, 27, 26, 25, 33, 32, 23, 22, 21, 19, 18, 5, 4, 2 };

void setZone(uint8_t zone, bool on) {
  if (zone < 1 || zone > 16) return;
  uint8_t pin = ZONE_PINS[zone - 1];
  digitalWrite(pin, on ? HIGH : LOW);
  // Publish status
  char topic[64];
  snprintf(topic, sizeof(topic), "sprinkler/zone/%d/status", zone);
  String payload = String("{\"status\":\"") + (on ? "on" : "off") + "\"}";
  client.publish(topic, payload.c_str(), true);
}

void callback(char* topic, byte* payload, unsigned int length) {
  // Parse topic: sprinkler/zone/{id}/control
  String t = String(topic);
  int start = t.indexOf("zone/");
  int slash = t.indexOf('/', start + 5);
  int zone = t.substring(start + 5, slash).toInt();
  String cmd;
  for (unsigned int i = 0; i < length; i++) cmd += (char)payload[i];
  cmd.toLowerCase();
  if (cmd == "on") setZone(zone, true);
  else if (cmd == "off") setZone(zone, false);
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("sprinkler-esp32")) {
      client.subscribe("sprinkler/zone/+/control");
    } else {
      delay(2000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  for (int i = 0; i < 16; i++) { pinMode(ZONE_PINS[i], OUTPUT); digitalWrite(ZONE_PINS[i], LOW); }
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); }
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();
}

