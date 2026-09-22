const farmers = [
    {
      "farmerId": "F001",
      "name": "Ramesh Patil",
      "age": 30,
      "gender": "Male",
      "location": "Nashik, Maharashtra",
      "contact": {
        "phone": "+91 9800000000",
        "email": "ramesh.patil@example.com"
      },
      "languagesSpoken": [
        "Hindi"
      ],
      "bio": "Experienced farmer specializing in Grapes, Onions.",
      "education": "B.Sc. Agriculture",
      "farmDetails": {
        "farmSize": "10 acres",
        "farmingMethod": "Organic",
        "certifications": [
          "Organic Farming Certificate"
        ],
        "waterSource": "Irrigation canal",
        "soilType": "Black cotton soil"
      },
      "crops": [
        {
          "name": "Grapes",
          "availableQuantity": "200 kg",
          "pricePerKg": 20
        },
        {
          "name": "Onions",
          "availableQuantity": "200 kg",
          "pricePerKg": 20
        }
      ],
      "experience": "5 years",
      "rating": 3.5,
      "profilePic": "https://example.com/farmer1.jpg",
      "status": "Busy",
      "lastUpdated": "2025-09-22",
      "tradingInfo": {
        "preferredPaymentMethods": [
          "Cash",
          "UPI",
          "Bank Transfer"
        ],
        "deliveryOptions": [
          "Self Pickup",
          "Farmer Delivery"
        ],
        "averageMonthlySupply": "1 tons",
        "pastBuyers": [
          "Local Traders",
          "AgroMart Pvt Ltd"
        ],
        "contracts": []
      },
      "reviews": [
        {
          "traderName": "GreenMart Traders",
          "rating": 4,
          "comment": "Good quality Grapes",
          "date": "2025-09-15"
        }
      ],
      "verificationStatus": "Verified",
      "lastActive": "2025-09-21 14:32",
      "connections": {
        "connectionsCount": 20,
        "mutualConnections": [
          "Farmer A",
          "Farmer B"
        ],
        "suggestedConnections": [
          "Farmer X",
          "Farmer Y"
        ]
      }
    },
    {
      "farmerId": "F002",
      "name": "Kavita Sharma",
      "age": 31,
      "gender": "Female",
      "location": "Amritsar, Punjab",
      "contact": {
        "phone": "+91 9800000001",
        "email": "kavita.sharma@example.com"
      },
      "languagesSpoken": [
        "Hindi",
        "English"
      ],
      "bio": "Experienced farmer specializing in Wheat, Mustard.",
      "education": "B.Sc. Agriculture",
      "farmDetails": {
        "farmSize": "11 acres",
        "farmingMethod": "Traditional",
        "certifications": [],
        "waterSource": "Rain-fed",
        "soilType": "Alluvial soil"
      },
      "crops": [
        {
          "name": "Wheat",
          "availableQuantity": "210 kg",
          "pricePerKg": 21
        },
        {
          "name": "Mustard",
          "availableQuantity": "210 kg",
          "pricePerKg": 21
        }
      ],
      "experience": "6 years",
      "rating": 3.6,
      "profilePic": "https://example.com/farmer2.jpg",
      "status": "Available",
      "lastUpdated": "2025-09-22",
      "tradingInfo": {
        "preferredPaymentMethods": [
          "Cash",
          "UPI",
          "Bank Transfer"
        ],
        "deliveryOptions": [
          "Self Pickup",
          "Farmer Delivery"
        ],
        "averageMonthlySupply": "2 tons",
        "pastBuyers": [
          "Local Traders",
          "AgroMart Pvt Ltd"
        ],
        "contracts": []
      },
      "reviews": [
        {
          "traderName": "GreenMart Traders",
          "rating": 5,
          "comment": "Good quality Wheat",
          "date": "2025-09-15"
        }
      ],
      "verificationStatus": "Unverified",
      "lastActive": "2025-09-21 14:32",
      "connections": {
        "connectionsCount": 21,
        "mutualConnections": [
          "Farmer A",
          "Farmer B"
        ],
        "suggestedConnections": [
          "Farmer X",
          "Farmer Y"
        ]
      }
    },
    {
      "farmerId": "F003",
      "name": "Suresh Yadav",
      "age": 32,
      "gender": "Male",
      "location": "Indore, Madhya Pradesh",
      "contact": {
        "phone": "+91 9800000002",
        "email": "suresh.yadav@example.com"
      },
      "languagesSpoken": [
        "Hindi",
        "English"
      ],
      "bio": "Experienced farmer specializing in Soybean, Cotton.",
      "education": "B.Sc. Agriculture",
      "farmDetails": {
        "farmSize": "12 acres",
        "farmingMethod": "Organic",
        "certifications": [],
        "waterSource": "Irrigation canal",
        "soilType": "Black cotton soil"
      },
      "crops": [
        {
          "name": "Soybean",
          "availableQuantity": "220 kg",
          "pricePerKg": 22
        },
        {
          "name": "Cotton",
          "availableQuantity": "220 kg",
          "pricePerKg": 22
        }
      ],
      "experience": "7 years",
      "rating": 3.7,
      "profilePic": "https://example.com/farmer3.jpg",
      "status": "Available",
      "lastUpdated": "2025-09-22",
      "tradingInfo": {
        "preferredPaymentMethods": [
          "Cash",
          "UPI",
          "Bank Transfer"
        ],
        "deliveryOptions": [
          "Self Pickup",
          "Farmer Delivery"
        ],
        "averageMonthlySupply": "3 tons",
        "pastBuyers": [
          "Local Traders",
          "AgroMart Pvt Ltd"
        ],
        "contracts": []
      },
      "reviews": [
        {
          "traderName": "GreenMart Traders",
          "rating": 4,
          "comment": "Good quality Soybean",
          "date": "2025-09-15"
        }
      ],
      "verificationStatus": "Verified",
      "lastActive": "2025-09-21 14:32",
      "connections": {
        "connectionsCount": 22,
        "mutualConnections": [
          "Farmer A",
          "Farmer B"
        ],
        "suggestedConnections": [
          "Farmer X",
          "Farmer Y"
        ]
      }
    },
    {
      "farmerId": "F004",
      "name": "Anita Deshmukh",
      "age": 33,
      "gender": "Female",
      "location": "Nagpur, Maharashtra",
      "contact": {
        "phone": "+91 9800000003",
        "email": "anita.deshmukh@example.com"
      },
      "languagesSpoken": [
        "Hindi"
      ],
      "bio": "Experienced farmer specializing in Oranges.",
      "education": "B.Sc. Agriculture",
      "farmDetails": {
        "farmSize": "13 acres",
        "farmingMethod": "Traditional",
        "certifications": [],
        "waterSource": "Rain-fed",
        "soilType": "Alluvial soil"
      },
      "crops": [
        {
          "name": "Oranges",
          "availableQuantity": "230 kg",
          "pricePerKg": 23
        }
      ],
      "experience": "8 years",
      "rating": 3.8,
      "profilePic": "https://example.com/farmer4.jpg",
      "status": "Busy",
      "lastUpdated": "2025-09-22",
      "tradingInfo": {
        "preferredPaymentMethods": [
          "Cash",
          "UPI",
          "Bank Transfer"
        ],
        "deliveryOptions": [
          "Self Pickup",
          "Farmer Delivery"
        ],
        "averageMonthlySupply": "4 tons",
        "pastBuyers": [
          "Local Traders",
          "AgroMart Pvt Ltd"
        ],
        "contracts": []
      },
      "reviews": [
        {
          "traderName": "GreenMart Traders",
          "rating": 5,
          "comment": "Good quality Oranges",
          "date": "2025-09-15"
        }
      ],
      "verificationStatus": "Unverified",
      "lastActive": "2025-09-21 14:32",
      "connections": {
        "connectionsCount": 23,
        "mutualConnections": [
          "Farmer A",
          "Farmer B"
        ],
        "suggestedConnections": [
          "Farmer X",
          "Farmer Y"
        ]
      }
    },
    {
      "farmerId": "F005",
      "name": "Mohammed Khan",
      "age": 34,
      "gender": "Male",
      "location": "Lucknow, Uttar Pradesh",
      "contact": {
        "phone": "+91 9800000004",
        "email": "mohammed.khan@example.com"
      },
      "languagesSpoken": [
        "Hindi",
        "English"
      ],
      "bio": "Experienced farmer specializing in Potatoes, Tomatoes.",
      "education": "B.Sc. Agriculture",
      "farmDetails": {
        "farmSize": "14 acres",
        "farmingMethod": "Organic",
        "certifications": [
          "Organic Farming Certificate"
        ],
        "waterSource": "Irrigation canal",
        "soilType": "Black cotton soil"
      },
      "crops": [
        {
          "name": "Potatoes",
          "availableQuantity": "240 kg",
          "pricePerKg": 24
        },
        {
          "name": "Tomatoes",
          "availableQuantity": "240 kg",
          "pricePerKg": 24
        }
      ],
      "experience": "9 years",
      "rating": 3.9,
      "profilePic": "https://example.com/farmer5.jpg",
      "status": "Available",
      "lastUpdated": "2025-09-22",
      "tradingInfo": {
        "preferredPaymentMethods": [
          "Cash",
          "UPI",
          "Bank Transfer"
        ],
        "deliveryOptions": [
          "Self Pickup",
          "Farmer Delivery"
        ],
        "averageMonthlySupply": "5 tons",
        "pastBuyers": [
          "Local Traders",
          "AgroMart Pvt Ltd"
        ],
        "contracts": []
      },
      "reviews": [
        {
          "traderName": "GreenMart Traders",
          "rating": 4,
          "comment": "Good quality Potatoes",
          "date": "2025-09-15"
        }
      ],
      "verificationStatus": "Verified",
      "lastActive": "2025-09-21 14:32",
      "connections": {
        "connectionsCount": 24,
        "mutualConnections": [
          "Farmer A",
          "Farmer B"
        ],
        "suggestedConnections": [
          "Farmer X",
          "Farmer Y"
        ]
      }
    },
    {
      "farmerId": "F006",
      "name": "Priya Verma",
      "age": 35,
      "gender": "Female",
      "location": "Patna, Bihar",
      "contact": {
        "phone": "+91 9800000005",
        "email": "priya.verma@example.com"
      },
      "languagesSpoken": [
        "Hindi",
        "English"
      ],
      "bio": "Experienced farmer specializing in Maize.",
      "education": "B.Sc. Agriculture",
      "farmDetails": {
        "farmSize": "15 acres",
        "farmingMethod": "Traditional",
        "certifications": [],
        "waterSource": "Rain-fed",
        "soilType": "Alluvial soil"
      },
      "crops": [
        {
          "name": "Maize",
          "availableQuantity": "250 kg",
          "pricePerKg": 25
        }
      ],
      "experience": "10 years",
      "rating": 4.0,
      "profilePic": "https://example.com/farmer6.jpg",
      "status": "Available",
      "lastUpdated": "2025-09-22",
      "tradingInfo": {
        "preferredPaymentMethods": [
          "Cash",
          "UPI",
          "Bank Transfer"
        ],
        "deliveryOptions": [
          "Self Pickup",
          "Farmer Delivery"
        ],
        "averageMonthlySupply": "1 tons",
        "pastBuyers": [
          "Local Traders",
          "AgroMart Pvt Ltd"
        ],
        "contracts": []
      },
      "reviews": [
        {
          "traderName": "GreenMart Traders",
          "rating": 5,
          "comment": "Good quality Maize",
          "date": "2025-09-15"
        }
      ],
      "verificationStatus": "Unverified",
      "lastActive": "2025-09-21 14:32",
      "connections": {
        "connectionsCount": 25,
        "mutualConnections": [
          "Farmer A",
          "Farmer B"
        ],
        "suggestedConnections": [
          "Farmer X",
          "Farmer Y"
        ]
      }
    },
    {
      "farmerId": "F007",
      "name": "Rajesh Gupta",
      "age": 36,
      "gender": "Male",
      "location": "Jaipur, Rajasthan",
      "contact": {
        "phone": "+91 9800000006",
        "email": "rajesh.gupta@example.com"
      },
      "languagesSpoken": [
        "Hindi"
      ],
      "bio": "Experienced farmer specializing in Barley, Wheat.",
      "education": "B.Sc. Agriculture",
      "farmDetails": {
        "farmSize": "16 acres",
        "farmingMethod": "Organic",
        "certifications": [],
        "waterSource": "Irrigation canal",
        "soilType": "Black cotton soil"
      },
      "crops": [
        {
          "name": "Barley",
          "availableQuantity": "260 kg",
          "pricePerKg": 26
        },
        {
          "name": "Wheat",
          "availableQuantity": "260 kg",
          "pricePerKg": 26
        }
      ],
      "experience": "11 years",
      "rating": 4.1,
      "profilePic": "https://example.com/farmer7.jpg",
      "status": "Busy",
      "lastUpdated": "2025-09-22",
      "tradingInfo": {
        "preferredPaymentMethods": [
          "Cash",
          "UPI",
          "Bank Transfer"
        ],
        "deliveryOptions": [
          "Self Pickup",
          "Farmer Delivery"
        ],
        "averageMonthlySupply": "2 tons",
        "pastBuyers": [
          "Local Traders",
          "AgroMart Pvt Ltd"
        ],
        "contracts": []
      },
      "reviews": [
        {
          "traderName": "GreenMart Traders",
          "rating": 4,
          "comment": "Good quality Barley",
          "date": "2025-09-15"
        }
      ],
      "verificationStatus": "Verified",
      "lastActive": "2025-09-21 14:32",
      "connections": {
        "connectionsCount": 26,
        "mutualConnections": [
          "Farmer A",
          "Farmer B"
        ],
        "suggestedConnections": [
          "Farmer X",
          "Farmer Y"
        ]
      }
    },
    {
      "farmerId": "F008",
      "name": "Sunita Reddy",
      "age": 37,
      "gender": "Female",
      "location": "Hyderabad, Telangana",
      "contact": {
        "phone": "+91 9800000007",
        "email": "sunita.reddy@example.com"
      },
      "languagesSpoken": [
        "Hindi",
        "English"
      ],
      "bio": "Experienced farmer specializing in Chillies, Turmeric.",
      "education": "B.Sc. Agriculture",
      "farmDetails": {
        "farmSize": "17 acres",
        "farmingMethod": "Traditional",
        "certifications": [],
        "waterSource": "Rain-fed",
        "soilType": "Alluvial soil"
      },
      "crops": [
        {
          "name": "Chillies",
          "availableQuantity": "270 kg",
          "pricePerKg": 27
        },
        {
          "name": "Turmeric",
          "availableQuantity": "270 kg",
          "pricePerKg": 27
        }
      ],
      "experience": "12 years",
      "rating": 4.2,
      "profilePic": "https://example.com/farmer8.jpg",
      "status": "Available",
      "lastUpdated": "2025-09-22",
      "tradingInfo": {
        "preferredPaymentMethods": [
          "Cash",
          "UPI",
          "Bank Transfer"
        ],
        "deliveryOptions": [
          "Self Pickup",
          "Farmer Delivery"
        ],
        "averageMonthlySupply": "3 tons",
        "pastBuyers": [
          "Local Traders",
          "AgroMart Pvt Ltd"
        ],
        "contracts": []
      },
      "reviews": [
        {
          "traderName": "GreenMart Traders",
          "rating": 5,
          "comment": "Good quality Chillies",
          "date": "2025-09-15"
        }
      ],
      "verificationStatus": "Unverified",
      "lastActive": "2025-09-21 14:32",
      "connections": {
        "connectionsCount": 27,
        "mutualConnections": [
          "Farmer A",
          "Farmer B"
        ],
        "suggestedConnections": [
          "Farmer X",
          "Farmer Y"
        ]
      }
    },
    {
      "farmerId": "F009",
      "name": "Amit Kumar",
      "age": 38,
      "gender": "Male",
      "location": "Delhi, India",
      "contact": {
        "phone": "+91 9800000008",
        "email": "amit.kumar@example.com"
      },
      "languagesSpoken": [
        "Hindi",
        "English"
      ],
      "bio": "Experienced farmer specializing in Vegetables.",
      "education": "B.Sc. Agriculture",
      "farmDetails": {
        "farmSize": "18 acres",
        "farmingMethod": "Organic",
        "certifications": [
          "Organic Farming Certificate"
        ],
        "waterSource": "Irrigation canal",
        "soilType": "Black cotton soil"
      },
      "crops": [
        {
          "name": "Vegetables",
          "availableQuantity": "280 kg",
          "pricePerKg": 28
        }
      ],
      "experience": "13 years",
      "rating": 4.3,
      "profilePic": "https://example.com/farmer9.jpg",
      "status": "Available",
      "lastUpdated": "2025-09-22",
      "tradingInfo": {
        "preferredPaymentMethods": [
          "Cash",
          "UPI",
          "Bank Transfer"
        ],
        "deliveryOptions": [
          "Self Pickup",
          "Farmer Delivery"
        ],
        "averageMonthlySupply": "4 tons",
        "pastBuyers": [
          "Local Traders",
          "AgroMart Pvt Ltd"
        ],
        "contracts": []
      },
      "reviews": [
        {
          "traderName": "GreenMart Traders",
          "rating": 4,
          "comment": "Good quality Vegetables",
          "date": "2025-09-15"
        }
      ],
      "verificationStatus": "Verified",
      "lastActive": "2025-09-21 14:32",
      "connections": {
        "connectionsCount": 28,
        "mutualConnections": [
          "Farmer A",
          "Farmer B"
        ],
        "suggestedConnections": [
          "Farmer X",
          "Farmer Y"
        ]
      }
    },
    {
      "farmerId": "F010",
      "name": "Meena Joshi",
      "age": 39,
      "gender": "Female",
      "location": "Bhopal, Madhya Pradesh",
      "contact": {
        "phone": "+91 9800000009",
        "email": "meena.joshi@example.com"
      },
      "languagesSpoken": [
        "Hindi"
      ],
      "bio": "Experienced farmer specializing in Pulses.",
      "education": "B.Sc. Agriculture",
      "farmDetails": {
        "farmSize": "19 acres",
        "farmingMethod": "Traditional",
        "certifications": [],
        "waterSource": "Rain-fed",
        "soilType": "Alluvial soil"
      },
      "crops": [
        {
          "name": "Pulses",
          "availableQuantity": "290 kg",
          "pricePerKg": 29
        }
      ],
      "experience": "14 years",
      "rating": 4.4,
      "profilePic": "https://example.com/farmer10.jpg",
      "status": "Busy",
      "lastUpdated": "2025-09-22",
      "tradingInfo": {
        "preferredPaymentMethods": [
          "Cash",
          "UPI",
          "Bank Transfer"
        ],
        "deliveryOptions": [
          "Self Pickup",
          "Farmer Delivery"
        ],
        "averageMonthlySupply": "5 tons",
        "pastBuyers": [
          "Local Traders",
          "AgroMart Pvt Ltd"
        ],
        "contracts": []
      },
      "reviews": [
        {
          "traderName": "GreenMart Traders",
          "rating": 5,
          "comment": "Good quality Pulses",
          "date": "2025-09-15"
        }
      ],
      "verificationStatus": "Unverified",
      "lastActive": "2025-09-21 14:32",
      "connections": {
        "connectionsCount": 29,
        "mutualConnections": [
          "Farmer A",
          "Farmer B"
        ],
        "suggestedConnections": [
          "Farmer X",
          "Farmer Y"
        ]
      }
    },
    {
      "farmerId": "F011",
      "name": "Vikas Chauhan",
      "age": 40,
      "gender": "Male",
      "location": "Kanpur, Uttar Pradesh",
      "contact": {
        "phone": "+91 9800000010",
        "email": "vikas.chauhan@example.com"
      },
      "languagesSpoken": [
        "Hindi",
        "English"
      ],
      "bio": "Experienced farmer specializing in Sugarcane.",
      "education": "B.Sc. Agriculture",
      "farmDetails": {
        "farmSize": "20 acres",
        "farmingMethod": "Organic",
        "certifications": [],
        "waterSource": "Irrigation canal",
        "soilType": "Black cotton soil"
      },
      "crops": [
        {
          "name": "Sugarcane",
          "availableQuantity": "300 kg",
          "pricePerKg": 30
        }
      ],
      "experience": "15 years",
      "rating": 4.5,
      "profilePic": "https://example.com/farmer11.jpg",
      "status": "Available",
      "lastUpdated": "2025-09-22",
      "tradingInfo": {
        "preferredPaymentMethods": [
          "Cash",
          "UPI",
          "Bank Transfer"
        ],
        "deliveryOptions": [
          "Self Pickup",
          "Farmer Delivery"
        ],
        "averageMonthlySupply": "1 tons",
        "pastBuyers": [
          "Local Traders",
          "AgroMart Pvt Ltd"
        ],
        "contracts": []
      },
      "reviews": [
        {
          "traderName": "GreenMart Traders",
          "rating": 4,
          "comment": "Good quality Sugarcane",
          "date": "2025-09-15"
        }
      ],
      "verificationStatus": "Verified",
      "lastActive": "2025-09-21 14:32",
      "connections": {
        "connectionsCount": 30,
        "mutualConnections": [
          "Farmer A",
          "Farmer B"
        ],
        "suggestedConnections": [
          "Farmer X",
          "Farmer Y"
        ]
      }
    },
    {
      "farmerId": "F012",
      "name": "Pooja Nair",
      "age": 41,
      "gender": "Female",
      "location": "Kochi, Kerala",
      "contact": {
        "phone": "+91 9800000011",
        "email": "pooja.nair@example.com"
      },
      "languagesSpoken": [
        "Hindi",
        "English"
      ],
      "bio": "Experienced farmer specializing in Coconut.",
      "education": "B.Sc. Agriculture",
      "farmDetails": {
        "farmSize": "21 acres",
        "farmingMethod": "Traditional",
        "certifications": [],
        "waterSource": "Rain-fed",
        "soilType": "Alluvial soil"
      },
      "crops": [
        {
          "name": "Coconut",
          "availableQuantity": "310 kg",
          "pricePerKg": 31
        }
      ],
      "experience": "16 years",
      "rating": 4.6,
      "profilePic": "https://example.com/farmer12.jpg",
      "status": "Available",
      "lastUpdated": "2025-09-22",
      "tradingInfo": {
        "preferredPaymentMethods": [
          "Cash",
          "UPI",
          "Bank Transfer"
        ],
        "deliveryOptions": [
          "Self Pickup",
          "Farmer Delivery"
        ],
        "averageMonthlySupply": "2 tons",
        "pastBuyers": [
          "Local Traders",
          "AgroMart Pvt Ltd"
        ],
        "contracts": []
      },
      "reviews": [
        {
          "traderName": "GreenMart Traders",
          "rating": 5,
          "comment": "Good quality Coconut",
          "date": "2025-09-15"
        }
      ],
      "verificationStatus": "Unverified",
      "lastActive": "2025-09-21 14:32",
      "connections": {
        "connectionsCount": 31,
        "mutualConnections": [
          "Farmer A",
          "Farmer B"
        ],
        "suggestedConnections": [
          "Farmer X",
          "Farmer Y"
        ]
      }
    },
    {
      "farmerId": "F013",
      "name": "Ajay Singh",
      "age": 42,
      "gender": "Male",
      "location": "Varanasi, Uttar Pradesh",
      "contact": {
        "phone": "+91 9800000012",
        "email": "ajay.singh@example.com"
      },
      "languagesSpoken": [
        "Hindi"
      ],
      "bio": "Experienced farmer specializing in Bananas.",
      "education": "B.Sc. Agriculture",
      "farmDetails": {
        "farmSize": "22 acres",
        "farmingMethod": "Organic",
        "certifications": [
          "Organic Farming Certificate"
        ],
        "waterSource": "Irrigation canal",
        "soilType": "Black cotton soil"
      },
      "crops": [
        {
          "name": "Bananas",
          "availableQuantity": "320 kg",
          "pricePerKg": 32
        }
      ],
      "experience": "17 years",
      "rating": 4.7,
      "profilePic": "https://example.com/farmer13.jpg",
      "status": "Busy",
      "lastUpdated": "2025-09-22",
      "tradingInfo": {
        "preferredPaymentMethods": [
          "Cash",
          "UPI",
          "Bank Transfer"
        ],
        "deliveryOptions": [
          "Self Pickup",
          "Farmer Delivery"
        ],
        "averageMonthlySupply": "3 tons",
        "pastBuyers": [
          "Local Traders",
          "AgroMart Pvt Ltd"
        ],
        "contracts": []
      },
      "reviews": [
        {
          "traderName": "GreenMart Traders",
          "rating": 4,
          "comment": "Good quality Bananas",
          "date": "2025-09-15"
        }
      ],
      "verificationStatus": "Verified",
      "lastActive": "2025-09-21 14:32",
      "connections": {
        "connectionsCount": 32,
        "mutualConnections": [
          "Farmer A",
          "Farmer B"
        ],
        "suggestedConnections": [
          "Farmer X",
          "Farmer Y"
        ]
      }
    },
    {
      "farmerId": "F014",
      "name": "Deepa Iyer",
      "age": 43,
      "gender": "Female",
      "location": "Chennai, Tamil Nadu",
      "contact": {
        "phone": "+91 9800000013",
        "email": "deepa.iyer@example.com"
      },
      "languagesSpoken": [
        "Hindi",
        "English"
      ],
      "bio": "Experienced farmer specializing in Rice.",
      "education": "B.Sc. Agriculture",
      "farmDetails": {
        "farmSize": "23 acres",
        "farmingMethod": "Traditional",
        "certifications": [],
        "waterSource": "Rain-fed",
        "soilType": "Alluvial soil"
      },
      "crops": [
        {
          "name": "Rice",
          "availableQuantity": "330 kg",
          "pricePerKg": 33
        }
      ],
      "experience": "18 years",
      "rating": 4.8,
      "profilePic": "https://example.com/farmer14.jpg",
      "status": "Available",
      "lastUpdated": "2025-09-22",
      "tradingInfo": {
        "preferredPaymentMethods": [
          "Cash",
          "UPI",
          "Bank Transfer"
        ],
        "deliveryOptions": [
          "Self Pickup",
          "Farmer Delivery"
        ],
        "averageMonthlySupply": "4 tons",
        "pastBuyers": [
          "Local Traders",
          "AgroMart Pvt Ltd"
        ],
        "contracts": []
      },
      "reviews": [
        {
          "traderName": "GreenMart Traders",
          "rating": 5,
          "comment": "Good quality Rice",
          "date": "2025-09-15"
        }
      ],
      "verificationStatus": "Unverified",
      "lastActive": "2025-09-21 14:32",
      "connections": {
        "connectionsCount": 33,
        "mutualConnections": [
          "Farmer A",
          "Farmer B"
        ],
        "suggestedConnections": [
          "Farmer X",
          "Farmer Y"
        ]
      }
    },
    {
      "farmerId": "F015",
      "name": "Arjun Das",
      "age": 44,
      "gender": "Male",
      "location": "Kolkata, West Bengal",
      "contact": {
        "phone": "+91 9800000014",
        "email": "arjun.das@example.com"
      },
      "languagesSpoken": [
        "Hindi",
        "English"
      ],
      "bio": "Experienced farmer specializing in Jute.",
      "education": "B.Sc. Agriculture",
      "farmDetails": {
        "farmSize": "24 acres",
        "farmingMethod": "Organic",
        "certifications": [],
        "waterSource": "Irrigation canal",
        "soilType": "Black cotton soil"
      },
      "crops": [
        {
          "name": "Jute",
          "availableQuantity": "340 kg",
          "pricePerKg": 34
        }
      ],
      "experience": "19 years",
      "rating": 4.9,
      "profilePic": "https://example.com/farmer15.jpg",
      "status": "Available",
      "lastUpdated": "2025-09-22",
      "tradingInfo": {
        "preferredPaymentMethods": [
          "Cash",
          "UPI",
          "Bank Transfer"
        ],
        "deliveryOptions": [
          "Self Pickup",
          "Farmer Delivery"
        ],
        "averageMonthlySupply": "5 tons",
        "pastBuyers": [
          "Local Traders",
          "AgroMart Pvt Ltd"
        ],
        "contracts": []
      },
      "reviews": [
        {
          "traderName": "GreenMart Traders",
          "rating": 4,
          "comment": "Good quality Jute",
          "date": "2025-09-15"
        }
      ],
      "verificationStatus": "Verified",
      "lastActive": "2025-09-21 14:32",
      "connections": {
        "connectionsCount": 34,
        "mutualConnections": [
          "Farmer A",
          "Farmer B"
        ],
        "suggestedConnections": [
          "Farmer X",
          "Farmer Y"
        ]
      }
    },
    {
      "farmerId": "F016",
      "name": "Savita Pawar",
      "age": 45,
      "gender": "Female",
      "location": "Pune, Maharashtra",
      "contact": {
        "phone": "+91 9800000015",
        "email": "savita.pawar@example.com"
      },
      "languagesSpoken": [
        "Hindi"
      ],
      "bio": "Experienced farmer specializing in Pomegranates.",
      "education": "B.Sc. Agriculture",
      "farmDetails": {
        "farmSize": "25 acres",
        "farmingMethod": "Traditional",
        "certifications": [],
        "waterSource": "Rain-fed",
        "soilType": "Alluvial soil"
      },
      "crops": [
        {
          "name": "Pomegranates",
          "availableQuantity": "350 kg",
          "pricePerKg": 35
        }
      ],
      "experience": "5 years",
      "rating": 3.5,
      "profilePic": "https://example.com/farmer16.jpg",
      "status": "Busy",
      "lastUpdated": "2025-09-22",
      "tradingInfo": {
        "preferredPaymentMethods": [
          "Cash",
          "UPI",
          "Bank Transfer"
        ],
        "deliveryOptions": [
          "Self Pickup",
          "Farmer Delivery"
        ],
        "averageMonthlySupply": "1 tons",
        "pastBuyers": [
          "Local Traders",
          "AgroMart Pvt Ltd"
        ],
        "contracts": []
      },
      "reviews": [
        {
          "traderName": "GreenMart Traders",
          "rating": 5,
          "comment": "Good quality Pomegranates",
          "date": "2025-09-15"
        }
      ],
      "verificationStatus": "Unverified",
      "lastActive": "2025-09-21 14:32",
      "connections": {
        "connectionsCount": 35,
        "mutualConnections": [
          "Farmer A",
          "Farmer B"
        ],
        "suggestedConnections": [
          "Farmer X",
          "Farmer Y"
        ]
      }
    },
    {
      "farmerId": "F017",
      "name": "Manoj Jha",
      "age": 46,
      "gender": "Male",
      "location": "Ahmedabad, Gujarat",
      "contact": {
        "phone": "+91 9800000016",
        "email": "manoj.jha@example.com"
      },
      "languagesSpoken": [
        "Hindi",
        "English"
      ],
      "bio": "Experienced farmer specializing in Groundnut.",
      "education": "B.Sc. Agriculture",
      "farmDetails": {
        "farmSize": "26 acres",
        "farmingMethod": "Organic",
        "certifications": [
          "Organic Farming Certificate"
        ],
        "waterSource": "Irrigation canal",
        "soilType": "Black cotton soil"
      },
      "crops": [
        {
          "name": "Groundnut",
          "availableQuantity": "360 kg",
          "pricePerKg": 36
        }
      ],
      "experience": "6 years",
      "rating": 3.6,
      "profilePic": "https://example.com/farmer17.jpg",
      "status": "Available",
      "lastUpdated": "2025-09-22",
      "tradingInfo": {
        "preferredPaymentMethods": [
          "Cash",
          "UPI",
          "Bank Transfer"
        ],
        "deliveryOptions": [
          "Self Pickup",
          "Farmer Delivery"
        ],
        "averageMonthlySupply": "2 tons",
        "pastBuyers": [
          "Local Traders",
          "AgroMart Pvt Ltd"
        ],
        "contracts": []
      },
      "reviews": [
        {
          "traderName": "GreenMart Traders",
          "rating": 4,
          "comment": "Good quality Groundnut",
          "date": "2025-09-15"
        }
      ],
      "verificationStatus": "Verified",
      "lastActive": "2025-09-21 14:32",
      "connections": {
        "connectionsCount": 36,
        "mutualConnections": [
          "Farmer A",
          "Farmer B"
        ],
        "suggestedConnections": [
          "Farmer X",
          "Farmer Y"
        ]
      }
    },
    {
      "farmerId": "F018",
      "name": "Rekha Sharma",
      "age": 47,
      "gender": "Female",
      "location": "Raipur, Chhattisgarh",
      "contact": {
        "phone": "+91 9800000017",
        "email": "rekha.sharma@example.com"
      },
      "languagesSpoken": [
        "Hindi",
        "English"
      ],
      "bio": "Experienced farmer specializing in Millets.",
      "education": "B.Sc. Agriculture",
      "farmDetails": {
        "farmSize": "27 acres",
        "farmingMethod": "Traditional",
        "certifications": [],
        "waterSource": "Rain-fed",
        "soilType": "Alluvial soil"
      },
      "crops": [
        {
          "name": "Millets",
          "availableQuantity": "370 kg",
          "pricePerKg": 37
        }
      ],
      "experience": "7 years",
      "rating": 3.7,
      "profilePic": "https://example.com/farmer18.jpg",
      "status": "Available",
      "lastUpdated": "2025-09-22",
      "tradingInfo": {
        "preferredPaymentMethods": [
          "Cash",
          "UPI",
          "Bank Transfer"
        ],
        "deliveryOptions": [
          "Self Pickup",
          "Farmer Delivery"
        ],
        "averageMonthlySupply": "3 tons",
        "pastBuyers": [
          "Local Traders",
          "AgroMart Pvt Ltd"
        ],
        "contracts": []
      },
      "reviews": [
        {
          "traderName": "GreenMart Traders",
          "rating": 5,
          "comment": "Good quality Millets",
          "date": "2025-09-15"
        }
      ],
      "verificationStatus": "Unverified",
      "lastActive": "2025-09-21 14:32",
      "connections": {
        "connectionsCount": 37,
        "mutualConnections": [
          "Farmer A",
          "Farmer B"
        ],
        "suggestedConnections": [
          "Farmer X",
          "Farmer Y"
        ]
      }
    },
    {
      "farmerId": "F019",
      "name": "Nitin Bhosle",
      "age": 48,
      "gender": "Male",
      "location": "Aurangabad, Maharashtra",
      "contact": {
        "phone": "+91 9800000018",
        "email": "nitin.bhosle@example.com"
      },
      "languagesSpoken": [
        "Hindi"
      ],
      "bio": "Experienced farmer specializing in Sunflower.",
      "education": "B.Sc. Agriculture",
      "farmDetails": {
        "farmSize": "28 acres",
        "farmingMethod": "Organic",
        "certifications": [],
        "waterSource": "Irrigation canal",
        "soilType": "Black cotton soil"
      },
      "crops": [
        {
          "name": "Sunflower",
          "availableQuantity": "380 kg",
          "pricePerKg": 38
        }
      ],
      "experience": "8 years",
      "rating": 3.8,
      "profilePic": "https://example.com/farmer19.jpg",
      "status": "Busy",
      "lastUpdated": "2025-09-22",
      "tradingInfo": {
        "preferredPaymentMethods": [
          "Cash",
          "UPI",
          "Bank Transfer"
        ],
        "deliveryOptions": [
          "Self Pickup",
          "Farmer Delivery"
        ],
        "averageMonthlySupply": "4 tons",
        "pastBuyers": [
          "Local Traders",
          "AgroMart Pvt Ltd"
        ],
        "contracts": []
      },
      "reviews": [
        {
          "traderName": "GreenMart Traders",
          "rating": 4,
          "comment": "Good quality Sunflower",
          "date": "2025-09-15"
        }
      ],
      "verificationStatus": "Verified",
      "lastActive": "2025-09-21 14:32",
      "connections": {
        "connectionsCount": 38,
        "mutualConnections": [
          "Farmer A",
          "Farmer B"
        ],
        "suggestedConnections": [
          "Farmer X",
          "Farmer Y"
        ]
      }
    },
    {
      "farmerId": "F020",
      "name": "Lata Mishra",
      "age": 49,
      "gender": "Female",
      "location": "Guwahati, Assam",
      "contact": {
        "phone": "+91 9800000019",
        "email": "lata.mishra@example.com"
      },
      "languagesSpoken": [
        "Hindi",
        "English"
      ],
      "bio": "Experienced farmer specializing in Tea.",
      "education": "B.Sc. Agriculture",
      "farmDetails": {
        "farmSize": "29 acres",
        "farmingMethod": "Traditional",
        "certifications": [],
        "waterSource": "Rain-fed",
        "soilType": "Alluvial soil"
      },
      "crops": [
        {
          "name": "Tea",
          "availableQuantity": "390 kg",
          "pricePerKg": 39
        }
      ],
      "experience": "9 years",
      "rating": 3.9,
      "profilePic": "https://example.com/farmer20.jpg",
      "status": "Available",
      "lastUpdated": "2025-09-22",
      "tradingInfo": {
        "preferredPaymentMethods": [
          "Cash",
          "UPI",
          "Bank Transfer"
        ],
        "deliveryOptions": [
          "Self Pickup",
          "Farmer Delivery"
        ],
        "averageMonthlySupply": "5 tons",
        "pastBuyers": [
          "Local Traders",
          "AgroMart Pvt Ltd"
        ],
        "contracts": []
      },
      "reviews": [
        {
          "traderName": "GreenMart Traders",
          "rating": 5,
          "comment": "Good quality Tea",
          "date": "2025-09-15"
        }
      ],
      "verificationStatus": "Unverified",
      "lastActive": "2025-09-21 14:32",
      "connections": {
        "connectionsCount": 39,
        "mutualConnections": [
          "Farmer A",
          "Farmer B"
        ],
        "suggestedConnections": [
          "Farmer X",
          "Farmer Y"
        ]
      }
    }
  ]

export default farmers;