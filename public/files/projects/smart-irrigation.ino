// Arduino smart irrigation — soil-moisture controlled pump (reference sketch)
// Wiring: capacitive soil sensor -> A0, relay module IN -> D7, DHT11 -> D2 (optional)

const int SOIL_PIN = A0;
const int RELAY_PIN = 7;

// Calibrate these two values for your sensor and soil:
const int DRY_READING = 620;   // sensor value in dry air / dry soil
const int WET_READING = 280;   // sensor value in saturated soil
const int START_BELOW = 35;    // start pump when moisture % drops below this
const int STOP_ABOVE = 60;     // stop pump when moisture % rises above this

bool pumpOn = false;

int moisturePercent() {
  int raw = analogRead(SOIL_PIN);
  return constrain(map(raw, DRY_READING, WET_READING, 0, 100), 0, 100);
}

void setup() {
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH); // most relay boards are active-LOW
  Serial.begin(9600);
}

void loop() {
  int m = moisturePercent();
  if (!pumpOn && m < START_BELOW) pumpOn = true;
  if (pumpOn && m > STOP_ABOVE) pumpOn = false;   // hysteresis avoids rapid cycling
  digitalWrite(RELAY_PIN, pumpOn ? LOW : HIGH);

  Serial.print("moisture="); Serial.print(m);
  Serial.print("% pump="); Serial.println(pumpOn ? "ON" : "OFF");
  delay(2000);
}
