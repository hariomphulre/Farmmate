# import time
# import smbus2
# import lgpio

# ADS1115_ADDRESS = 0x48  

# ADS1115_POINTER_CONVERSION = 0x00
# ADS1115_POINTER_CONFIG = 0x01

# CONFIG_OS_SINGLE = 0x8000
# CONFIG_MUX_A0 = 0x4000   
# CONFIG_GAIN_ONE = 0x0200 
# CONFIG_MODE_SINGLE = 0x0100
# CONFIG_DR_128SPS = 0x0080
# CONFIG_COMP_QUE_DISABLE = 0x0003
# Vcc = 5.0

# MUX = {
#     0: 0x4000,  # AIN0
#     1: 0x5000,  # AIN1
#     2: 0x6000,  # AIN2
#     3: 0x7000   # AIN3
# }

# BUZZER_PIN=20

# chip = lgpio.gpiochip_open(0)

# lgpio.gpio_claim_output(chip, BUZZER_PIN)


# def read_adc_channel(bus, channel):
#     if channel == 0:
#         mux = CONFIG_MUX_A0
#     elif channel == 1:
#         mux = 0x5000
#     elif channel == 2:
#         mux = 0x6000
#     elif channel == 3:
#         mux = 0x7000
#     else:
#         raise ValueError("Invalid channel: 0-3 allowed")

#     config = (CONFIG_OS_SINGLE | mux | CONFIG_GAIN_ONE | 
#               CONFIG_MODE_SINGLE | CONFIG_DR_128SPS | CONFIG_COMP_QUE_DISABLE)

#     bus.write_i2c_block_data(ADS1115_ADDRESS, ADS1115_POINTER_CONFIG,
#                              [(config >> 8) & 0xFF, config & 0xFF])

#     time.sleep(0.01)

#     data = bus.read_i2c_block_data(ADS1115_ADDRESS, ADS1115_POINTER_CONVERSION, 2)
#     raw_adc = (data[0] << 8) | data[1]

#     if raw_adc > 0x7FFF:
#         raw_adc -= 0x10000

#     return raw_adc

# if __name__ == "__main__":
#     bus = smbus2.SMBus(1) 
#     try:
#         while True:
            
#             mq_value = read_adc_channel(bus, 0)  
#             rain_value = read_adc_channel(bus, 1)  
#             soilMoist_value=read_adc_channel(bus,2)
#             tds_value=read_adc_channel(bus,3)

#             mq_voltage = mq_value * 4.096 / 32768.0 
#             gas_percent = (mq_voltage / Vcc) * 100

#             rain_voltage = rain_value * 4.096 / 32768.0
#             rain_percent = (rain_voltage / 5.0) * 100

#             soil_voltage = soilMoist_value * 4.096 / 32768.0
#             soil_percent = (soil_voltage / 5.0) * 100 

#             tds_voltage = tds_value * 4.096 / 32768.0 
#             tds = (133.42*tds_voltage**3 - 255.86*tds_voltage**2 + 857.39*tds_voltage) * 0.5
#             air_status="☢️ High Gas detected"
#             rain_status="☁️ No Rain detected"

#             if(gas_percent<30):
#                 air_status="✅ Clean air"
#             elif(gas_percent<60):
#                 air_status="⚠️ Moderate Gas detected"
            
#             if(100-rain_percent>50):
#                 rain_status="⛈️ Heavy Rain detected"
#             elif(100-rain_percent>40):
#                 rain_status="🌧️ Moderate Rain detected"
        
#             print(f"MQ Sensor voltage: {mq_voltage:.2f} V, Gas: {gas_percent:.1f}%, {air_status}") 
#             print(f"Rain Sensor voltage: {rain_voltage:.2f} V, Rain: {100-rain_percent:.1f}%, {rain_status}")
#             print(f"Soil Moisture Sensor voltage: {soil_voltage:.2f} V, Soil Moisture: {soil_percent:.1f}%")
#             print(f"TDS: {tds:.2f} ppm")

#             if(gas_percent>=30 or 100-rain_percent>40):
#                 lgpio.gpio_write(chip, BUZZER_PIN, 0)
#                 print("🔊 BUZZER ON")
#                 print("------------------------------------------")

#                 while(gas_percent>=30 or 100-rain_percent>40):
#                     mq_value = read_adc_channel(bus, 0)  
#                     rain_value = read_adc_channel(bus, 1)  
#                     soilMoist_value=read_adc_channel(bus,2)
#                     tds_value=read_adc_channel(bus,3)

#                     mq_voltage = mq_value * 4.096 / 32768.0 
#                     gas_percent = (mq_voltage / Vcc) * 100

#                     rain_voltage = rain_value * 4.096 / 32768.0
#                     rain_percent = (rain_voltage / 5.0) * 100

#                     soil_voltage = soilMoist_value * 4.096 / 32768.0
#                     soil_percent = (soil_voltage / 5.0) * 100 

#                     tds_voltage = tds_value * 4.096 / 32768.0 
#                     tds = (133.42*tds_voltage**3 - 255.86*tds_voltage**2 + 857.39*tds_voltage) * 0.5
#                     air_status="☢️ High Gas detected"
#                     rain_status="☁️ No Rain detected"

#                     if(gas_percent<30):
#                         air_status="✅ Clean air"
#                     elif(gas_percent<60):
#                         air_status="⚠️ Moderate Gas detected"
                    
#                     if(100-rain_percent>50):
#                         rain_status="⛈️ Heavy Rain detected"
#                     elif(100-rain_percent>40):
#                         rain_status="🌧️ Moderate Rain detected"
                
#                     print(f"MQ Sensor voltage: {mq_voltage:.2f} V, Gas: {gas_percent:.1f}%, {air_status}") 
#                     print(f"Rain Sensor voltage: {rain_voltage:.2f} V, Rain: {100-rain_percent:.1f}%, {rain_status}")
#                     print(f"Soil Moisture Sensor voltage: {soil_voltage:.2f} V, Soil Moisture: {soil_percent:.1f}%")
#                     print(f"TDS: {tds:.2f} ppm")

#                     print("🔊 BUZZER ON")

#                     print("------------------------------------------")
#                     time.sleep(1)

#             lgpio.gpio_write(chip, BUZZER_PIN, 1)
#             print("🔇 BUZZER OFF")


#             print("------------------------------------------")

#             time.sleep(1)

#     except KeyboardInterrupt:
#         print("Exiting...")
#         bus.close()



import time
import serial
import lgpio

# GPIO pin used for DE/RE (MAX485 direction control)
DE_RE_PIN = 16
chip = lgpio.gpiochip_open(0)
lgpio.gpio_claim_output(chip, DE_RE_PIN)

# Open serial port
ser = serial.Serial("/dev/serial0", baudrate=9600, timeout=1)

# CRC16 calculator
def crc16(data: bytes):
    crc = 0xFFFF
    for pos in data:
        crc ^= pos
        for _ in range(8):
            if crc & 1:
                crc >>= 1
                crc ^= 0xA001
            else:
                crc >>= 1
    return crc

# Build Modbus query
def build_query(addr, reg, length):
    req = bytearray([addr, 0x03, (reg >> 8) & 0xFF, reg & 0xFF, (length >> 8) & 0xFF, length & 0xFF])
    crc = crc16(req)
    req.append(crc & 0xFF)
    req.append((crc >> 8) & 0xFF)
    return bytes(req)

# Send query
def send_query(query):
    lgpio.gpio_write(chip, DE_RE_PIN, 1)  # Enable TX
    time.sleep(0.01)
    ser.write(query)
    ser.flush()
    time.sleep(0.01)
    lgpio.gpio_write(chip, DE_RE_PIN, 0)  # Enable RX

while True:
    # Try reading 3 registers starting at 0x001E
    query = build_query(1, 0x001E, 3)
    send_query(query)

    time.sleep(0.2)
    response = ser.read(20)  # Read up to 20 bytes

    if response:
        print("Raw response:", response.hex(" "))
    else:
        print("⚠️ No response")

    time.sleep(2)