// Upload sample order data to Firebase
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const sampleOrders = [
  {
    amount: 4.99,
    createdAt: "4 January 2026 at 03:43:01 UTC+2",
    currency: "USD",
    itemId: "plan_1",
    itemName: "Popular Pack",
    itemType: "Coin Plan",
    status: "Completed",
    transactionId: "TXN123456",
    userId: "user_0",
    userName: "Mr John Smith"
  },
  {
    amount: 12.74,
    createdAt: "4 January 2026 at 04:15:23 UTC+2",
    currency: "USD",
    itemId: "plan_2",
    itemName: "Mega Bundle",
    itemType: "Coin Plan",
    status: "Completed",
    transactionId: "TXN123457",
    userId: "user_1",
    userName: "Mrs Sarah Johnson"
  },
  {
    amount: 5.39,
    createdAt: "4 January 2026 at 05:22:45 UTC+2",
    currency: "USD",
    itemId: "plan_1",
    itemName: "Premium Pack",
    itemType: "Coin Plan",
    status: "Completed",
    transactionId: "TXN123458",
    userId: "user_2",
    userName: "Mr Michael Brown"
  },
  {
    amount: 1.07,
    createdAt: "4 January 2026 at 06:10:12 UTC+2",
    currency: "USD",
    itemId: "plan_0",
    itemName: "Quick Charge",
    itemType: "Coin Plan",
    status: "Completed",
    transactionId: "TXN123459",
    userId: "user_3",
    userName: "Ms Emily Davis"
  },
  {
    amount: 12.74,
    createdAt: "4 January 2026 at 07:33:34 UTC+2",
    currency: "USD",
    itemId: "plan_2",
    itemName: "Mega Bundle",
    itemType: "Coin Plan",
    status: "Completed",
    transactionId: "TXN123460",
    userId: "user_4",
    userName: "Mr Robert Wilson"
  },
  {
    amount: 5.39,
    createdAt: "4 January 2026 at 08:45:56 UTC+2",
    currency: "USD",
    itemId: "plan_1",
    itemName: "Premium Pack",
    itemType: "Coin Plan",
    status: "Completed",
    transactionId: "TXN123461",
    userId: "user_5",
    userName: "Ms Jessica Martinez"
  },
  {
    amount: 4.99,
    createdAt: "4 January 2026 at 09:12:18 UTC+2",
    currency: "USD",
    itemId: "plan_1",
    itemName: "Popular Pack",
    itemType: "Coin Plan",
    status: "Completed",
    transactionId: "TXN123462",
    userId: "user_6",
    userName: "Mr David Anderson"
  },
  {
    amount: 1.07,
    createdAt: "4 January 2026 at 10:28:40 UTC+2",
    currency: "USD",
    itemId: "plan_0",
    itemName: "Quick Charge",
    itemType: "Coin Plan",
    status: "Completed",
    transactionId: "TXN123463",
    userId: "user_7",
    userName: "Mrs Lisa Thompson"
  },
  {
    amount: 12.74,
    createdAt: "4 January 2026 at 11:55:02 UTC+2",
    currency: "USD",
    itemId: "plan_2",
    itemName: "Mega Bundle",
    itemType: "Coin Plan",
    status: "Completed",
    transactionId: "TXN123464",
    userId: "user_8",
    userName: "Mr James Garcia"
  },
  {
    amount: 5.39,
    createdAt: "4 January 2026 at 12:40:24 UTC+2",
    currency: "USD",
    itemId: "plan_1",
    itemName: "Premium Pack",
    itemType: "Coin Plan",
    status: "Completed",
    transactionId: "TXN123465",
    userId: "user_9",
    userName: "Ms Jennifer Rodriguez"
  }
];

async function uploadOrders() {
  try {
    console.log('🔥 Uploading order data to Firebase...');
    
    for (let i = 0; i < sampleOrders.length; i++) {
      const order = sampleOrders[i];
      const docId = `order_${i}`;
      const docRef = doc(db, 'orders', docId);
      
      await setDoc(docRef, order);
      console.log(`✅ Uploaded: ${order.userName} - ${order.itemName} ($${order.amount})`);
    }
    
    console.log(`🎉 Successfully uploaded ${sampleOrders.length} orders!`);
    console.log('📊 Orders include:');
    console.log('  - 3 Quick Charge orders ($1.07 each)');
    console.log('  - 3 Premium Pack orders ($5.39 each)');
    console.log('  - 3 Mega Bundle orders ($12.74 each)');
    console.log('  - 1 Popular Pack order ($4.99)');
    console.log(`💰 Total Revenue: $${sampleOrders.reduce((sum, order) => sum + order.amount, 0).toFixed(2)}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error uploading orders:', error);
    return false;
  }
}

uploadOrders();
