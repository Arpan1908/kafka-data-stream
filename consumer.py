from kafka import KafkaConsumer
import json
import psycopg2


consumer = KafkaConsumer(
    'ecommerce_activity',
    bootstrap_servers='localhost:9092',
    auto_offset_reset='earliest', 
    value_deserializer=lambda x: json.loads(x.decode('utf-8'))
)


conn = psycopg2.connect(
    dbname='kafka-ecom',
    user='8i1n54',
    password='API_KEY',
    host='us-east-1.sql.xata.sh',
    port='5432'
)
cursor = conn.cursor()

try:
    for message in consumer:
     
        data = message.value
        
      
        query = """
        INSERT INTO activity_log (user_id, activity_type, product_id, timestamp)
        VALUES (%s, %s, %s, %s);
        """
        cursor.execute(query, (data['user_id'], data['activity_type'], data['product_id'], data['timestamp']))
        
       
        conn.commit()

        print(f"Stored: {data}")

except KeyboardInterrupt:
    pass

finally:
    cursor.close()
    conn.close()