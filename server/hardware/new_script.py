# import time
# import smbus2
# import lgpio

# ADS1115_ADDRESS = 0x48

# ADS1115_POINTER_CONVERSION = 0x00
# ADS1115_POINTER_CONFIG = 0x01

# CONFIG_OS_SINGLE = 0x8000
# CONFIG_GAIN_ONE = 0x0200
# CONFIG_MODE_SINGLE = 0x0100
# CONFIG_DR_128SPS = 0x0080
# CONFIG_COMP_QUE_DISABLE = 0x0003

# # Note: The ADC gain is set to +/- 4.096V max. 
# # Ensure your 5V sensors use voltage dividers before hitting the ADC.
# Vcc = 5.0  

# MUX = {
#     0: 0x4000,  # AIN0
#     1: 0x5000,  # AIN1
#     2: 0x6000,  # AIN2
#     3: 0x7000   # AIN3
# }

# BUZZER_PIN = 20
# chip = lgpio.gpiochip_open(0)
# lgpio.gpio_claim_output(chip, BUZZER_PIN)

# # Initialize buzzer to OFF (Assuming Active-Low: 1 = OFF, 0 = ON)
# lgpio.gpio_write(chip, BUZZER_PIN, 1)

# def read_adc_channel(bus, channel):
#     if channel not in MUX:
#         raise ValueError("Invalid channel: 0-3 allowed")

#     mux = MUX[channel]
#     config = (CONFIG_OS_SINGLE | mux | CONFIG_GAIN_ONE | 
#               CONFIG_MODE_SINGLE | CONFIG_DR_128SPS | CONFIG_COMP_QUE_DISABLE)

#     bus.write_i2c_block_data(ADS1115_ADDRESS, ADS1115_POINTER_CONFIG,
#                              [(config >> 8) & 0xFF, config & 0xFF])

#     # Increased slightly to 15ms to guarantee the 128SPS conversion is finished
#     time.sleep(0.015)

#     data = bus.read_i2c_block_data(ADS1115_ADDRESS, ADS1115_POINTER_CONVERSION, 2)
#     raw_adc = (data[0] << 8) | data[1]

#     if raw_adc > 0x7FFF:
#         raw_adc -= 0x10000

#     return raw_adc

# if __name__ == "__main__":
#     bus = smbus2.SMBus(1) 
#     try:
#         while True:
#             mq_value = read_adc_channel(bus, 2)  
#             rain_value = read_adc_channel(bus, 3)  
#             soilMoist_value = read_adc_channel(bus, 0)
#             tds_value = read_adc_channel(bus, 1)

#             mq_voltage = mq_value * 4.096 / 32768.0 
#             gas_percent = (mq_voltage / Vcc) * 100

#             rain_voltage = rain_value * 4.096 / 32768.0
#             rain_percent = (rain_voltage / Vcc) * 100

#             soil_voltage = soilMoist_value * 4.096 / 32768.0
#             soil_percent = (soil_voltage / Vcc) * 100 

#             tds_voltage = tds_value * 4.096 / 32768.0 
#             tds = (133.42 * tds_voltage**3 - 255.86 * tds_voltage**2 + 857.39 * tds_voltage) * 0.5
            
#             air_status = "☢️ High Gas detected"
#             rain_status = "☁️ No Rain detected"

#             if gas_percent < 30:
#                 air_status = "✅ Clean air"
#             elif gas_percent < 60:
#                 air_status = "⚠️ Moderate Gas detected"
            
#             if 100 - rain_percent > 50:
#                 rain_status = "⛈️ Heavy Rain detected"
#             elif 100 - rain_percent > 40:
#                 rain_status = "🌧️ Moderate Rain detected"
        
#             print(f"MQ Sensor voltage: {mq_voltage:.2f} V, Gas: {gas_percent:.1f}%, {air_status}") 
#             print(f"Rain Sensor voltage: {rain_voltage:.2f} V, Rain: {100-rain_percent:.1f}%, {rain_status}")
#             print(f"Soil Moisture Sensor voltage: {soil_voltage:.2f} V, Soil Moisture: {100 - soil_percent:.1f}%")
#             print(f"TDS: {tds:.2f} ppm")

#             # Alarm Handling Logic
#             if gas_percent >= 30 or 100 - rain_percent > 40:
#                 lgpio.gpio_write(chip, BUZZER_PIN, 0)
#                 print("🔊 BUZZER ON")
#             else:
#                 lgpio.gpio_write(chip, BUZZER_PIN, 1)
#                 print("🔇 BUZZER OFF")

#             print("------------------------------------------")
#             time.sleep(1)

#     except KeyboardInterrupt:
#         print("\nExiting...")
#     finally:
#         # Hardware cleanup
#         lgpio.gpio_write(chip, BUZZER_PIN, 1) # Turn off buzzer
#         lgpio.gpiochip_close(chip)
#         bus.close()






import time
import smbus2
import lgpio
import glob  # Required for reading the DS18B20 system file

ADS1115_ADDRESS = 0x48

ADS1115_POINTER_CONVERSION = 0x00
ADS1115_POINTER_CONFIG = 0x01

CONFIG_OS_SINGLE = 0x8000
CONFIG_GAIN_ONE = 0x0200
CONFIG_MODE_SINGLE = 0x0100
CONFIG_DR_128SPS = 0x0080
CONFIG_COMP_QUE_DISABLE = 0x0003

# Note: The ADC gain is set to +/- 4.096V max. 
# Ensure your 5V sensors use voltage dividers before hitting the ADC.
Vcc = 5.0

MUX = {
    0: 0x4000,  # AIN0
    1: 0x5000,  # AIN1
    2: 0x6000,  # AIN2
    3: 0x7000   # AIN3
}

BUZZER_PIN = 20
chip = lgpio.gpiochip_open(0)
lgpio.gpio_claim_output(chip, BUZZER_PIN)

# Initialize buzzer to OFF (Assuming Active-Low: 1 = OFF, 0 = ON)
lgpio.gpio_write(chip, BUZZER_PIN, 1)

def read_adc_channel(bus, channel):
    if channel not in MUX:
        raise ValueError("Invalid channel: 0-3 allowed")

    mux = MUX[channel]
    config = (CONFIG_OS_SINGLE | mux | CONFIG_GAIN_ONE | 
              CONFIG_MODE_SINGLE | CONFIG_DR_128SPS | CONFIG_COMP_QUE_DISABLE)

    bus.write_i2c_block_data(ADS1115_ADDRESS, ADS1115_POINTER_CONFIG,
                             [(config >> 8) & 0xFF, config & 0xFF])

    # Increased slightly to 15ms to guarantee the 128SPS conversion is finished
    time.sleep(0.015)

    data = bus.read_i2c_block_data(ADS1115_ADDRESS, ADS1115_POINTER_CONVERSION, 2)
    raw_adc = (data[0] << 8) | data[1]

    if raw_adc > 0x7FFF:
        raw_adc -= 0x10000

    return raw_adc

def read_ds18b20():
    """Reads the 1-Wire temperature sensor via the Linux sysfs interface."""
    devices = glob.glob("/sys/bus/w1/devices/28-*/w1_slave")
    if not devices:
        return None  # Sensor not found or 1-Wire not enabled
    
    try:
        with open(devices[0], 'r') as f:
            lines = f.read().strip().splitlines()
        
        # Check if the CRC check passed
        if not lines or not lines[0].endswith("YES"):
            return None
        
        # Extract the temperature value
        temp_string = lines[1].split("t=")[1]
        return float(temp_string) / 1000.0
    except Exception:
        return None

if __name__ == "__main__":
    bus = smbus2.SMBus(1) 
    try:
        while True:
            mq_value = read_adc_channel(bus, 2)  
            rain_value = read_adc_channel(bus, 3)  
            soilMoist_value = read_adc_channel(bus, 0)
            tds_value = read_adc_channel(bus, 1)

            # Read Temperature
            temperature_c = read_ds18b20()

            mq_voltage = mq_value * 4.096 / 32768.0 
            gas_percent = (mq_voltage / Vcc) * 100

            rain_voltage = rain_value * 4.096 / 32768.0
            rain_percent = (rain_voltage / Vcc) * 100

            soil_voltage = soilMoist_value * 4.096 / 32768.0
            soil_percent = (soil_voltage / Vcc) * 100 

            tds_voltage = tds_value * 4.096 / 32768.0 
            tds = (133.42 * tds_voltage**3 - 255.86 * tds_voltage**2 + 857.39 * tds_voltage) * 0.5
            
            air_status = "☢️ High Gas detected"
            rain_status = "☁️ No Rain detected"

            if gas_percent < 30:
                air_status = "✅ Clean air"
            elif gas_percent < 60:
                air_status = "⚠️ Moderate Gas detected"
            
            if 100 - rain_percent > 50:
                rain_status = "⛈️ Heavy Rain detected"
            elif 100 - rain_percent > 40:
                rain_status = "🌧️ Moderate Rain detected"
        
            print(f"MQ Sensor voltage: {mq_voltage:.2f} V, Gas: {gas_percent:.1f}%, {air_status}") 
            print(f"Rain Sensor voltage: {rain_voltage:.2f} V, Rain: {100-rain_percent:.1f}%, {rain_status}")
            print(f"Soil Moisture Sensor voltage: {soil_voltage:.2f} V, Soil Moisture: {100 - soil_percent:.1f}%")
            print(f"TDS: {tds:.2f} ppm")
            
            # Print Temperature formatting gracefully if sensor is unplugged
            if temperature_c is not None:
                print(f"Water Temperature: {temperature_c:.2f} °C")
            else:
                print("Water Temperature: Sensor Error / Not Found")

            # Alarm Handling Logic
            if gas_percent >= 30 or 100 - rain_percent > 40:
                lgpio.gpio_write(chip, BUZZER_PIN, 0)
                print("🔊 BUZZER ON")
            else:
                lgpio.gpio_write(chip, BUZZER_PIN, 1)
                print("🔇 BUZZER OFF")

            print("------------------------------------------")
            time.sleep(1)

    except KeyboardInterrupt:
        print("\nExiting...")
    finally:
        # Hardware cleanup
        lgpio.gpio_write(chip, BUZZER_PIN, 1) # Turn off buzzer
        lgpio.gpiochip_close(chip)
        bus.close()