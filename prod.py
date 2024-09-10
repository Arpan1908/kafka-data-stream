import six
import sys


if sys.version_info >= (3, 12, 0):
    sys.modules['kafka.vendor.six.moves'] = six.moves

# Your main script
from kafka import KafkaProducer
import json
import time
import random


producer = KafkaProducer(
    bootstrap_servers='localhost:9092',
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)


ACTIVITIES = ["page_view", "product_view", "cart_addition", "purchase"]

def simulate_activity():
    user_id = random.randint(1, 1000)  
    activity = random.choice(ACTIVITIES)
    product_id = random.randint(1, 100) if activity != "page_view" else None 

    return {
        "user_id": user_id,
        "activity_type": activity,
        "product_id": product_id,
        "timestamp": time.strftime('%Y-%m-%d %H:%M:%S')
    }


try:
    while True:
        activity = simulate_activity()
        producer.send('ecommerce_activity', activity)
        print(f"Sent: {activity}")
        time.sleep(random.randint(1, 5))  
except KeyboardInterrupt:
    producer.close()
