/*
    Video: https://www.youtube.com/watch?v=oCMOYS71NIU
    Based on Neil Kolban example for IDF: https://github.com/nkolban/esp32-snippets/blob/master/cpp_utils/tests/BLE%20Tests/SampleNotify.cpp
    Ported to Arduino ESP32 by Evandro Copercini
   Create a BLE server that, once we receive a connection, will send periodic notifications.
   The service advertises itself as: 6E400001-B5A3-F393-E0A9-E50E24DCCA9E
   Has a characteristic of: 6E400002-B5A3-F393-E0A9-E50E24DCCA9E - used for receiving data with "WRITE"
   Has a characteristic of: 6E400003-B5A3-F393-E0A9-E50E24DCCA9E - used to send data with  "NOTIFY"
   The design of creating the BLE server is:
   1. Create a BLE Server
   2. Create a BLE Service
   3. Create a BLE Characteristic on the Service
   4. Create a BLE Descriptor on the characteristic
   5. Start the service.
   6. Start advertising.
   In this example rxValue is the data received (only accessible inside that function).
   And txValue is the data to be sent, in this example just a byte incremented every second.
*/

#include <Arduino.h>

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoNvs.h>
#include <WiFi.h>
#include <Preferences.h>
#include <esp32-hal-cpu.h>
//#include <ESPmDNS.h>
//#include <WebServer.h>
//#include <WiFiMulti.h>
//#include "esp_http_client.h"
// #include <ArduinoJson.h>

// String chipId;
//  See the following for generating UUIDs:
//  https://www.uuidgenerator.net/
#define SERVICE_UUID_wifi                 "6E400001-B5A3-F393-E0A9-E50E24DCCA9E" // UART service UUID
#define SERVICE_UUID_LD2410               "6E400002-B5A3-F393-E0A9-E50E24DCCA9E" // UART service UUID
#define CHARACTERISTIC_UUID_Wifi_ssid     "dea04111-ffce-4152-b6b1-9049eefdd97a"
#define CHARACTERISTIC_UUID_Wifi_Pwd      "81f0b721-56d7-4b82-a2f1-d53f9911fe8b"
#define CHARACTERISTIC_UUID_MQTT_Site     "60fdb096-901d-4fc3-85b0-cc5ce6b5d037"
#define CHARACTERISTIC_UUID_MQTT_port     "6925960c-ac10-41cb-ad88-bb762c9f16c6"
#define CHARACTERISTIC_UUID_MQTT_Account  "f91ae54a-4882-48ff-b0e0-fd1f0fb1cf0d"
#define CHARACTERISTIC_UUID_MQTT_pwd      "f10e9de3-7ceb-4ce5-8b43-e2f517296e32"
#define CHARACTERISTIC_UUID_LD2410_Th     "e0f956da-2708-488d-bcc5-dd8b19676222"
#define CHARACTERISTIC_UUID_LD2410_Status "921af35a-4165-4f5b-988f-91cb5733a485"
#define CHARACTERISTIC_UUID_Net_States    "df460c3e-50ae-466c-a503-cac4c01d5398"
#define CHARACTERISTIC_UUID_Judge_Params  "c015a05b-9617-455a-97ad-4e44ea286cd2"
#define CHARACTERISTIC_UUID_Send_CMD      "c015a05c-9617-455a-97ad-4e44ea286cd2"
#define CHARACTERISTIC_UUID_LD2410_Result "c015a05d-9617-455a-97ad-4e44ea286cd2"

#define AP_SSID  "esp32"

const int led1 = 12;
const int led2 = 13;
const int rxpin = 1;
const int txpin = 0;
const int ldrPin = 2;

const int mqtt_period = 10 * 60;     //单位:s,  表示 mqtt 每隔5min发送一次
const int serial_period = 2;    //单位:s,  表示 串口 每隔2s发送一次
const int ldr_period = 10;    //单位:s,  表示 ldr 每隔10s检测一次

// NVS 区域, 存储 wifi 和 mqtt 信息
Preferences preferences;
esp_sleep_wakeup_cause_t wakeup_reason;

// mqtt
WiFiClient espClient;
PubSubClient mqttclient(espClient);

//蓝牙控制
int resr_count_down = 120;
int ble_inited = 0;
TimerHandle_t xTimer_rest;

BLEServer *pServer = NULL;
BLEService *pService_wifi = NULL;
BLEService *pService_LD2410 = NULL;
BLECharacteristic *pWifi_ssidCharacteristic;
BLECharacteristic *pWifi_PwdCharacteristic;
BLECharacteristic *pMQTT_SiteCharacteristic;
BLECharacteristic *pMQTT_portCharacteristic;
BLECharacteristic *pMQTT_AccountCharacteristic;
BLECharacteristic *pMQTT_pwdCharacteristic;

BLECharacteristic *pLD2410_ThCharacteristic;
BLECharacteristic *pLD2410_StatusCharacteristic;
BLECharacteristic *pNet_StatesCharacteristic;
BLECharacteristic *pJudge_ParamsCharacteristic;
BLECharacteristic *pSend_CMDCharacteristic;
BLECharacteristic *pLD2410_ResultCharacteristic;
bool deviceConnected = false;
bool oldDeviceConnected = false;

//蓝牙通信 buf 
uint8_t txValue = 0;
uint8_t txbuf[25] = {0};
uint8_t NetState[2] = {0, 0}; // byte[0] 表示 wifi 状态, [1]表示mqtt状态
String resStr;
String chipId;
String readString;
String wifi_ssid;
String wifi_pwd;
String mqtt_site;
uint16_t mqtt_port;
String mqtt_account;
String mqtt_pwd;

// mqtt 通信 buf

// LD2410 通信buf
int ldr_value = 0;
char read_buf[100];
const int t_s = 19;
const int s_s = 30;
const int org_state_p = 8;
const int M_D_p = 9;
const int M_S_p = 11;
const int ML_D_p = 12;
const int ML_S_p = 14;
const int distance_p = 15;



// LD2410 状态及判定
uint8_t LD2410_th[18] = {0, 1, 2, 3};   // 前9个是运动状态, 后9个是静止状态

// 分别是持续多少次判定有人运动状态, 持续多少次判定有人静止状态, 持续多少次判定无人运动状态, 持续多少次判定无人静止状态
uint8_t continue_times[4] = {10, 10, 10, 10}; 

// 第一个是状态: 0 无人, 1 有人静止 2 有人运动 
// 后面两个是猜测运动状态距离, 猜测静止状态距离
uint8_t LD2410_result[3] = {0, 1, 2};
int sb_move, sb_not_move, sb_silent, sb_not_silent = 0;   

// 临时变量
// int i = 0;
int alive_state = 0;
int silent_state = 1;
int raw_data = 0;
int old_state = 0;
int mqtt_cnt = 0;
int serial_cnt = 0;
int ldr_cnt = 0;

void initBLE();
void MqttRecvCallback(char *topic, byte *payload, unsigned int length);
int StartWifiMqtt();
void restCallback(TimerHandle_t xTimer);
void updata_BLECharacteristic();
void updata_data_from_nvs();
void updata_BLE_Net_State();
void proc_LD2410_data();
void WiFiEvent(WiFiEvent_t event);

// service 的回调函数, 接入将提示, 断开就重启
class MyServerCallbacks : public BLEServerCallbacks
{
  void onConnect(BLEServer *pServer)
  {
    deviceConnected = true;
    resr_count_down = 999999999;    // 一旦连接, 把该值设置到足够大, 避免断开蓝牙
    oldDeviceConnected = deviceConnected;
    Serial.println("现在有设备接入~");
  };

  void onDisconnect(BLEServer *pServer)
  {
    deviceConnected = false;
    delay(500);                  // give the bluetooth stack the chance to get things ready
    resr_count_down = 120;   // 客户端断开蓝牙2分钟后, 设备将关闭蓝牙
    Serial.println("disconnected client, reset esp32");
//    ESP.restart();
    pServer->startAdvertising(); // restart advertising
    Serial.println("start advertising");
    oldDeviceConnected = deviceConnected;
  }
};


class MyCallbacksWifi_ssid : public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic *pCharacteristic)
  { //* 客户端写入事件回调函数
    std::string rxValue = pCharacteristic->getValue();
    preferences.putString("wifi_ssid", rxValue.c_str());

    if (rxValue.length() > 0)
    {
      // 打印接收内容
      Serial.println("*********");
      Serial.print("Wifi_ssid Received Value: ");
      for (int i = 0; i < rxValue.length(); i++)
      {
        Serial.print(rxValue[i]);
        resStr += rxValue[i];
      }
      Serial.println();
      Serial.println("*********"); 
    }

  }
};

class MyCallbacksWifi_Pwd : public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic *pCharacteristic)
  { //* 客户端写入事件回调函数
    std::string rxValue = pCharacteristic->getValue();
    preferences.putString("wifi_pwd", rxValue.c_str());

    if (rxValue.length() > 0)
    {
      // 打印接收内容
      Serial.println("*********");
      Serial.print("Wifi_Pwd Received Value: ");
      for (int i = 0; i < rxValue.length(); i++)
      {
        Serial.print(rxValue[i]);
        resStr += rxValue[i];
      }
      Serial.println();
      Serial.println("*********"); 
    }
  }
};

class MyCallbacksMQTT_Site : public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic *pCharacteristic)
  { //* 客户端写入事件回调函数
    std::string rxValue = pCharacteristic->getValue();
    preferences.putString("mqtt_site", rxValue.c_str());

    if (rxValue.length() > 0)
    {
      // 打印接收内容
      Serial.println("*********");
      Serial.print("MQTT_Site Received Value: ");
      for (int i = 0; i < rxValue.length(); i++)
      {
        Serial.print(rxValue[i]);
        resStr += rxValue[i];
      }
      Serial.println();
      Serial.println("*********"); 
    }
  }
};

class MyCallbacksMQTT_port : public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic *pCharacteristic)
  { //* 客户端写入事件回调函数
    uint16_t t;
    std::string rxValue = pCharacteristic->getValue();
    t = atoi(rxValue.c_str());
    preferences.putInt("mqtt_port", t);

    if (rxValue.length() > 0)
    {
      // 打印接收内容
      Serial.println("*********");
      Serial.print("MQTT_port Received Value: ");
      for (int i = 0; i < rxValue.length(); i++)
      {
        Serial.print(rxValue[i]);
        resStr += rxValue[i];
      }
      Serial.println();
      Serial.println("*********"); 
    }
  }
};

class MyCallbacksMQTT_Account : public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic *pCharacteristic)
  { //* 客户端写入事件回调函数
    std::string rxValue = pCharacteristic->getValue();
    preferences.putString("mqtt_account", rxValue.c_str());

    if (rxValue.length() > 0)
    {
      // 打印接收内容
      Serial.println("*********");
      Serial.print("MQTT_Account Received Value: ");
      for (int i = 0; i < rxValue.length(); i++)
      {
        Serial.print(rxValue[i]);
        resStr += rxValue[i];
      }
      Serial.println();
      Serial.println("*********"); 
    }
  }
};

class MyCallbacksMQTT_pwd : public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic *pCharacteristic)
  { //* 客户端写入事件回调函数
    int sta;
    std::string rxValue = pCharacteristic->getValue();
    preferences.putString("mqtt_pwd", rxValue.c_str());
    Serial.printf("write mqtt_pwd to NVS = %s \n\r", rxValue.c_str());
    Serial.println("StartWifiMqtt.......");
    sta = StartWifiMqtt();
    Serial.printf("StartWifiMqtt return %d.......\n\r", sta);

    if (rxValue.length() > 0)
    {
      // 打印接收内容
      Serial.println("*********");
      Serial.print("MQTT_pwd Received Value: ");
      for (int i = 0; i < rxValue.length(); i++)
      {
        Serial.print(rxValue[i]);
        resStr += rxValue[i];
      }
      Serial.println();
      Serial.println("*********"); 
    }
  }
};

class MyCallbacksLD2410_Th : public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic *pCharacteristic)
  { //* 客户端写入事件回调函数
    std::string rxValue = pCharacteristic->getValue();

    if (rxValue.length() > 0)
    {
      // 打印接收内容
      Serial.println("*********");
      Serial.print("LD2410_Th Received Value: ");
      for (int i = 0; i < rxValue.length(); i++)
      {
        Serial.printf("%d, ", rxValue[i]);
        LD2410_th[i] = rxValue[i] > 100 ? 100 : rxValue[i];
      }
      preferences.putBytes("LD2410_th", LD2410_th, 18);
      Serial.println();
      Serial.println("*********");

    }
  }
};

class MyCallbacksJudge_Params : public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic *pCharacteristic)
  { //* 客户端写入事件回调函数
    std::string rxValue = pCharacteristic->getValue();
    preferences.putString("Judge_Params", rxValue.c_str());

    if (rxValue.length() > 0)
    {
      // 打印接收内容
      Serial.println("*********");
      Serial.print("Judge_Params Received Value: ");
      for (int i = 0; i < rxValue.length(); i++)
      {
        Serial.printf("%d", rxValue[i]);
        continue_times[i] = rxValue[i];
      }
      preferences.putBytes("continue_times", continue_times, sizeof(continue_times));
      Serial.println();
      Serial.println("*********"); 
    }
  }
};

class MyCallbacksSend_CMD : public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic *pCharacteristic)
  { //* 客户端写入事件回调函数
    std::string rxValue = pCharacteristic->getValue();
    preferences.putString("Send_CMD", rxValue.c_str());

    if (rxValue.length() > 0)
    {
      // 打印接收内容
      Serial.println("*********");
      Serial.print("Send_CMD Received Value: ");
      for (int i = 0; i < rxValue.length(); i++)
      {
        Serial.print(rxValue[i]);
        resStr += rxValue[i];
      }
      Serial.println();
      Serial.println("*********"); 
    }

    // byte[0] = 0x01:  请求上传当前网络信息, LD2410配置信息
    if (rxValue[0] == 0x01)
    {
      updata_BLECharacteristic();
    }
  }
};

void setup()
{
  int p = 0;
  int sta = 0;
  String wifi_ssid = "";
  String wifi_pwd = "";
  String mqtt_site = "";
  int mqtt_port = 0;
  String mqtt_account = "";
  String mqtt_pwd = "";byte mac[6];
  WiFi.macAddress(mac);
  String uniq =  String(mac[0],HEX) +String(mac[1],HEX) +String(mac[2],HEX) +String(mac[3],HEX) + String(mac[4],HEX) + String(mac[5],HEX);
  //!--------- 以下为初始化部分
  
  preferences.begin("sp_data", false);
  Serial.begin(115200);  
  WiFi.onEvent(WiFiEvent);
  setCpuFrequencyMhz(80);
  esp_sleep_enable_timer_wakeup(100 * 1000);
  WiFi.setSleep(WIFI_PS_MIN_MODEM);
  Serial1.begin(256000, SERIAL_8N1, rxpin, txpin);
  pinMode(led1, OUTPUT);
  digitalWrite(led1, 0);
//  chipId = String((uint32_t)ESP.getEfuseMac(), HEX);
  chipId = uniq;
  chipId.toUpperCase();
  //  chipid =ESP.getEfuseMac();
  Serial.printf("Chip id: %s\n", chipId.c_str());
  Serial.println(chipId);

  wakeup_reason = esp_sleep_get_wakeup_cause();
  switch(wakeup_reason)
  {
    case ESP_SLEEP_WAKEUP_EXT0 : Serial.println("Wakeup caused by external signal using RTC_IO"); break;
    case ESP_SLEEP_WAKEUP_EXT1 : Serial.println("Wakeup caused by external signal using RTC_CNTL"); break;
    case ESP_SLEEP_WAKEUP_TIMER : Serial.println("Wakeup caused by timer"); break;
    case ESP_SLEEP_WAKEUP_TOUCHPAD : Serial.println("Wakeup caused by touchpad"); break;
    case ESP_SLEEP_WAKEUP_ULP : Serial.println("Wakeup caused by ULP program"); break;
    default : Serial.printf("Wakeup was not caused by deep sleep: %d\n",wakeup_reason); break;
  }

  if (wakeup_reason == ESP_SLEEP_WAKEUP_UNDEFINED)
  {
    initBLE();  
    xTimer_rest = xTimerCreate("xTimer_rest", 1000 / portTICK_PERIOD_MS, pdTRUE, ( void * ) 0, restCallback);
    xTimerStart(xTimer_rest, 0 );  //开启定时器
    Serial.println("start a timer...");
  } 

  //!------- 尝试从 nvs 区域读取wifi信息, 并连接wifi
  Serial.println("try to connect to wifi...");
  sta = StartWifiMqtt();

  delay(1000);
}

void loop()
{
  char msg[100];
  char title[100];
  delay(100); 
  if ((WiFi.status() != WL_CONNECTED) || (mqttclient.loop() == false))
  {
    Serial.println("network have encounted critical errors");
    esp_deep_sleep_start();
  }
  if (resr_count_down < 0)
  {
    xTimerStop(xTimer_rest, 0);
    Serial.println("stop the timer to wait ble");
    Serial.println("esp32 will be restarted");
    esp_deep_sleep_start();
  }
  while (1) 
  {
    Serial1.read(read_buf, 45);
    if ((read_buf[0] == 0xF4) && (read_buf[1] == 0xF3) && (read_buf[2] == 0xF2) && (read_buf[3] == 0xF1))
    {
      break;
    }
  }
  proc_LD2410_data();
  // Reading potentiometer value
  if (ldr_cnt++ > ldr_period * 10)
  {
    ldr_cnt = 0;
    ldr_value = 0;
    for (int i = 0; i < 32; i++)
    {
      ldr_value = ldr_value + analogRead(ldrPin);
    }
    ldr_value = ldr_value >> 5;
  }
  

  if (serial_cnt++ > serial_period * 10)
  {
    serial_cnt = 0;
    Serial.printf("ldr_value = %d, sb_move = %d, sb_not_move = %d, sb_silent = %d, sb_not_silent =  = %d, result = %d\n\r", ldr_value, sb_move, sb_not_move, sb_silent, sb_not_silent, LD2410_result[0]);
    Serial.printf("cpu freq = %d MHz\n\r", getCpuFrequencyMhz());
  }
  
  if ((mqtt_cnt++ > mqtt_period * 10) or (old_state != LD2410_result[0])) // mqtt_period * 10
  {
    mqtt_cnt = 0;
    sprintf(msg, "{ \"human_exist\": %d, \"ldr_value\": %d}", LD2410_result[0], ldr_value);
    sprintf(title, "homeassistant/sensor/ESP32_ID%s/state", chipId);
    mqttclient.publish(title, msg);
    Serial.println("push to mqtt");
  }
  old_state = LD2410_result[0]; 

  if (deviceConnected)
  {
    //        pTxCharacteristic->setValue(&txValue, 1);
    //        pTxCharacteristic->notify();
    //        txValue++;
    //    delay(10); // bluetooth stack will go into congestion, if too many packets are sent
    for (int i = 0; i < 9; i++)
    {
      txbuf[i] = read_buf[t_s + i];
      txbuf[9 + i] = read_buf[s_s + i];
    }
    pLD2410_StatusCharacteristic->setValue(txbuf, 18);
    pLD2410_StatusCharacteristic->notify();
//    Serial.printf("sent: ", txbuf);
//    for (int i = 0; i < 18; i++)
//    {
//      Serial.printf("0x%02x ", txbuf[i]);
//    }
//    Serial.println(" ");  
    pLD2410_ResultCharacteristic->setValue(LD2410_result, sizeof(LD2410_result));
    pLD2410_ResultCharacteristic->notify();
  }
  // disconnecting
  if (!deviceConnected && oldDeviceConnected)
  {
  }
  // connecting
  if (deviceConnected && !oldDeviceConnected)
  {
    // do stuff here on connecting
    
  }
};

void MqttRecvCallback(char *topic, byte *payload, unsigned int length)
{
  Serial.print("Message arrived in topic: ");
  Serial.println(topic);
  Serial.print("Message:");
  for (int i = 0; i < length; i++)
  {
    Serial.print((char)payload[i]);
  }
  Serial.println();
  Serial.println("-----------------------");
};

int StartWifiMqtt()
{
  int i = 0;
  const int limit_i = 10;
  updata_data_from_nvs();

  // 打开 wifi, 等待2s看能否连接, 如果不能连接, 则退出该函数
//  WiFi.mode(WIFI_STA);
  i = wifi_ssid.compareTo("");
  Serial.printf("wifi_ssid equal NULL? = %d\n\r", i);
  if (i) {
    Serial.printf("start wifi  ssid = %s   pwd = %s\n\r", wifi_ssid.c_str(), wifi_pwd.c_str());
    WiFi.begin(wifi_ssid.c_str(), wifi_pwd.c_str());
  }

  i = 0;
  NetState[0] = 0;
  NetState[1] = 0;
  updata_BLE_Net_State();
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(1000);
    Serial.println("Connectingto WiFi..");
    if (i++ == limit_i)
    {
      Serial.println("Connect WiFi failed..");
      NetState[0] = 0;
      NetState[1] = 0;
      updata_BLE_Net_State();
      return -1;   // 连接 wifi 失败
    }
  }
  if (i == (limit_i + 1))
  {
    Serial.println("break start wifi_mqtt progress");
  }

  // 假设成功连接, 则尝试连接mqtt服务器, 5s没有连上, 则退出
  NetState[0] = 1;  
  updata_BLE_Net_State();
  Serial.printf("%d: Connected to the WiFi network\n\r", i);
  mqttclient.disconnect();
  mqttclient.setServer(mqtt_site.c_str(), mqtt_port);
  mqttclient.setKeepAlive(mqtt_period * 2);
  mqttclient.setCallback(MqttRecvCallback);
  i= 0;
  while (!mqttclient.connected())
  {
    char name[100];
    Serial.println("Connecting to MQTT...");
    sprintf(name, "ESP32HM-%s", chipId);
    if (mqttclient.connect(name, mqtt_account.c_str(), mqtt_pwd.c_str()))
    {
      Serial.println("connected");
    }
    else
    {
      Serial.print("failed with state ");
      Serial.print(mqttclient.state());
      delay(1000);
      if (i++ == 5)
      {
        Serial.println("connect to mqtt server failed, break the progress");
        return -2;   // 连接 mqtt 失败
      }
    }
  }

  if (mqttclient.connected())
  {
    NetState[1] = 1;
    updata_BLE_Net_State();
    mqttclient.subscribe("ESP32/ESP32_human_exist/set");
  } 
  
  return 0;
};


void restCallback(TimerHandle_t xTimer ) 
{ //长时间不访问蓝牙将停掉蓝牙
  resr_count_down --;
  Serial.print("resr_count_down: ");
  Serial.println(resr_count_down);
};



void initBLE()
{  
  //!---------- 以下将设置并开启蓝牙
  // Create the BLE Device
  char name[100];
  sprintf(name, "HMConfigWifi-ID%s", chipId);
  BLEDevice::init(name);

  // Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create the BLE Service
  pService_wifi = pServer->createService(SERVICE_UUID_wifi);
  pService_LD2410 = pServer->createService(SERVICE_UUID_LD2410);

  // Create a BLE Characteristic
  pWifi_ssidCharacteristic = pService_wifi->createCharacteristic(
      CHARACTERISTIC_UUID_Wifi_ssid,
      BLECharacteristic::PROPERTY_NOTIFY |  BLECharacteristic::PROPERTY_WRITE);
  pWifi_ssidCharacteristic->setCallbacks(new MyCallbacksWifi_ssid());

  pWifi_PwdCharacteristic = pService_wifi->createCharacteristic(
      CHARACTERISTIC_UUID_Wifi_Pwd,
      BLECharacteristic::PROPERTY_NOTIFY |  BLECharacteristic::PROPERTY_WRITE);
  pWifi_PwdCharacteristic->setCallbacks(new MyCallbacksWifi_Pwd());

  pMQTT_SiteCharacteristic = pService_wifi->createCharacteristic(
      CHARACTERISTIC_UUID_MQTT_Site,
      BLECharacteristic::PROPERTY_NOTIFY |  BLECharacteristic::PROPERTY_WRITE);
  pMQTT_SiteCharacteristic->setCallbacks(new MyCallbacksMQTT_Site());

  pMQTT_portCharacteristic = pService_wifi->createCharacteristic(
      CHARACTERISTIC_UUID_MQTT_port,
      BLECharacteristic::PROPERTY_NOTIFY |  BLECharacteristic::PROPERTY_WRITE);
  pMQTT_portCharacteristic->setCallbacks(new MyCallbacksMQTT_port());

  pMQTT_AccountCharacteristic = pService_wifi->createCharacteristic(
      CHARACTERISTIC_UUID_MQTT_Account,
      BLECharacteristic::PROPERTY_NOTIFY |  BLECharacteristic::PROPERTY_WRITE);
  pMQTT_AccountCharacteristic->setCallbacks(new MyCallbacksMQTT_Account());

  pMQTT_pwdCharacteristic = pService_wifi->createCharacteristic(
      CHARACTERISTIC_UUID_MQTT_pwd,
      BLECharacteristic::PROPERTY_NOTIFY |  BLECharacteristic::PROPERTY_WRITE);
  pMQTT_pwdCharacteristic->setCallbacks(new MyCallbacksMQTT_pwd());

  pLD2410_ThCharacteristic = pService_LD2410->createCharacteristic(
      CHARACTERISTIC_UUID_LD2410_Th,
      BLECharacteristic::PROPERTY_NOTIFY |  BLECharacteristic::PROPERTY_WRITE);
  pLD2410_ThCharacteristic->setCallbacks(new MyCallbacksLD2410_Th());

  pLD2410_StatusCharacteristic = pService_LD2410->createCharacteristic(
      CHARACTERISTIC_UUID_LD2410_Status,
      BLECharacteristic::PROPERTY_NOTIFY);

  pNet_StatesCharacteristic = pService_LD2410->createCharacteristic(
      CHARACTERISTIC_UUID_Net_States,
      BLECharacteristic::PROPERTY_NOTIFY);

  pJudge_ParamsCharacteristic = pService_LD2410->createCharacteristic(
      CHARACTERISTIC_UUID_Judge_Params,
      BLECharacteristic::PROPERTY_NOTIFY |  BLECharacteristic::PROPERTY_WRITE);
  pJudge_ParamsCharacteristic->setCallbacks(new MyCallbacksJudge_Params());

  pSend_CMDCharacteristic = pService_LD2410->createCharacteristic(
      CHARACTERISTIC_UUID_Send_CMD,
      BLECharacteristic::PROPERTY_NOTIFY |  BLECharacteristic::PROPERTY_WRITE);
  pSend_CMDCharacteristic->setCallbacks(new MyCallbacksSend_CMD());

  pLD2410_ResultCharacteristic = pService_LD2410->createCharacteristic(
      CHARACTERISTIC_UUID_LD2410_Result,
      BLECharacteristic::PROPERTY_NOTIFY);


  // Start the service
  pService_wifi->start();
  pService_LD2410->start();

  // Start advertising
  pServer->getAdvertising()->start();
  ble_inited = 1;
  Serial.println("Waiting a client connection to notify...");
};

void updata_data_from_nvs(void)
{
  int ok;
  int i;
  wifi_ssid = preferences.getString ("wifi_ssid");
  Serial.printf("read wifi_ssid from NVS = %s\n\r", wifi_ssid);
  wifi_pwd = preferences.getString ("wifi_pwd");
  Serial.printf("read wifi_pwd from NVS = %s\n\r", wifi_pwd);
  mqtt_site = preferences.getString ("mqtt_site");
  Serial.printf("read mqtt_site from NVS = %s\n\r", mqtt_site);
  mqtt_port = preferences.getInt ("mqtt_port");
  Serial.printf("read mqtt_port from NVS = %d\n\r", mqtt_port);
  mqtt_account = preferences.getString ("mqtt_account");
  Serial.printf("read mqtt_account from NVS = %s\n\r", mqtt_account);
  mqtt_pwd = preferences.getString ("mqtt_pwd");  
  Serial.printf("read mqtt_pwd from NVS = %s\n\r", mqtt_pwd);
  
  size_t blobLength = preferences.getBytesLength("LD2410_th");
  Serial.printf("blobLength = %d, sizeof(LD2410_th) = %d\n\r", blobLength, sizeof(LD2410_th));
  if (blobLength == 18)
  {
    Serial.printf("buf addr = %x\n\r", LD2410_th);
    ok = preferences.getBytes("LD2410_th", LD2410_th, 18);
    Serial.printf("read LD2410_th from NVS = %d\n\r", ok);
    for (i = 0; i < 18; i++)
    {
      Serial.printf("%d, ", LD2410_th[i]);
    }
    Serial.println();
  }
  else
  {
    Serial.println("LD2410_th bolb save error");
  }  

  blobLength = preferences.getBytesLength("continue_times");
  Serial.printf("blobLength = %d, sizeof(continue_times) = %d\n\r", blobLength, sizeof(continue_times));
  if (blobLength == 4)
  {
    ok = preferences.getBytes("continue_times", continue_times, 4);
    Serial.printf("read continue_times from NVS = %d\n\r", ok);
    for (i = 0; i < 4; i++)
    {
      Serial.printf("%d, ", continue_times[i]);
    }
    Serial.println();
  }
  else
  {
    Serial.println("continue_times bolb save error");
  } 
}

void updata_BLECharacteristic(void)
{
  char t[20];
  uint8_t *pu8_t;

  // 从 NVS 取数据
  wifi_ssid.toCharArray(t, 20);
  pWifi_ssidCharacteristic->setValue((uint8_t *)t, wifi_ssid.length());  
  Serial.printf("set pWifi_ssidCharacteristic = %s\n\r", t);  
  pWifi_ssidCharacteristic->notify();
  
  wifi_pwd.toCharArray(t, 20);
  pWifi_PwdCharacteristic->setValue((uint8_t *)t, wifi_pwd.length());
  Serial.printf("set pWifi_PwdCharacteristic = %s\n\r", t);
  pWifi_PwdCharacteristic->notify();
  
  mqtt_site.toCharArray(t, 20);
  pMQTT_SiteCharacteristic->setValue((uint8_t *)t, mqtt_site.length());
  Serial.printf("set pMQTT_SiteCharacteristic = %s\n\r", t);
  pMQTT_SiteCharacteristic->notify();
  pMQTT_portCharacteristic->setValue(mqtt_port);
  Serial.printf("set pMQTT_portCharacteristic = %d\n\r", mqtt_port);
  pMQTT_portCharacteristic->notify();
  
  mqtt_account.toCharArray(t, 20);
  pMQTT_AccountCharacteristic->setValue((uint8_t *)t, mqtt_account.length());
  Serial.printf("set pMQTT_AccountCharacteristic = %s\n\r", t);
  pMQTT_AccountCharacteristic->notify();
  
  mqtt_pwd.toCharArray(t, 20);
  pMQTT_pwdCharacteristic->setValue((uint8_t *)t, mqtt_pwd.length());
  Serial.printf("set pMQTT_pwdCharacteristic = %s\n\r", t);
  pMQTT_pwdCharacteristic->notify();

  pNet_StatesCharacteristic->setValue((uint8_t *)NetState, 2);
  pNet_StatesCharacteristic->notify();

  pLD2410_ThCharacteristic->setValue((uint8_t *)LD2410_th, 18);
  pLD2410_ThCharacteristic->notify();

  pJudge_ParamsCharacteristic->setValue((uint8_t *)continue_times, sizeof(continue_times));
  pJudge_ParamsCharacteristic->notify();
}

void updata_BLE_Net_State()
{
  if (deviceConnected)
  {
    Serial.println("updata net states");
    pNet_StatesCharacteristic->setValue((uint8_t *)NetState, 2);
    pNet_StatesCharacteristic->notify();
  }
}

void proc_LD2410_data()
{
  int diff[18];
  int i;
  for (i = 0; i < 9; i++)
  {
    diff[i] = read_buf[t_s + i] - LD2410_th[i];
    diff[9 + i] = read_buf[s_s + i] - LD2410_th[9 + i];
  }
  for (i = 0; i < 9; i++)
  {
    if (diff[i] > 0)
    {
      break;
    }
  }
  if (i < 9)
  {
    sb_move++;    
    if (sb_move > continue_times[0])
    {
      sb_not_move = 0;
    }
  }
  else
  {
    sb_not_move++;
    if (sb_not_move > continue_times[1])
    {
      sb_move = 0;
    }
  }
  for (i = 0; i < 9; i++)
  {
    if (diff[9 + i] > 0)
    {
      break;
    }
  }
  if (i < 9)
  {
    sb_silent++;    
    if (sb_silent > continue_times[2])
    {
      sb_not_silent = 0;
    }
  }
  else
  {
    sb_not_silent++;
    if (sb_not_silent > continue_times[3])
    {
      sb_silent = 0;
    }
  }
  if (sb_move > continue_times[0])
  {
    LD2410_result[0] = 2;  // 表示有人运动
  }
  else if (sb_silent > continue_times[2])
  {
    LD2410_result[0] = 1;  // 表示有人静止
  }
  else if (sb_not_move > continue_times[1] && sb_not_silent > continue_times[3])
  {
    LD2410_result[0] = 0;  // 表示无人
  }
  else
  {
    LD2410_result[0] = LD2410_result[0];
  }
}

void WiFiEvent(WiFiEvent_t event)
{
    switch(event) {
        case ARDUINO_EVENT_WIFI_AP_START:
            Serial.println("AP Started");
//            WiFi.softAPsetHostname(AP_SSID);
            break;
        case ARDUINO_EVENT_WIFI_AP_STOP:
            Serial.println("AP Stopped");
            break;
        case ARDUINO_EVENT_WIFI_STA_START:
            Serial.println("STA Started");
//            WiFi.setHostname(AP_SSID);
            break;
        case ARDUINO_EVENT_WIFI_STA_CONNECTED:
            Serial.println("STA Connected");
//            WiFi.enableIpV6();
            break;
        case ARDUINO_EVENT_WIFI_STA_GOT_IP6:
            Serial.print("STA IPv6: ");
            Serial.println(WiFi.localIPv6());
            break;
        case ARDUINO_EVENT_WIFI_STA_GOT_IP:
            Serial.print("STA IPv4: ");
            Serial.println(WiFi.localIP());
            break;
        case ARDUINO_EVENT_WIFI_STA_DISCONNECTED:
            Serial.println("STA Disconnected");
            break;
        case ARDUINO_EVENT_WIFI_STA_STOP:
            Serial.println("STA Stopped");
            break;
        default:
            break;
    }
}