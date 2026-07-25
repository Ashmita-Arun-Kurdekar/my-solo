const bcrypt = require("bcrypt");
const passwords = [
  // Managers
  "Priya123",
  "Amit123",
  "Sneha123",
  "Karan123",

  // IT Department
  "Aarav123",
  "Ananya123",
  "Rohan123",
  "Meera123",
  "Vivek123",
  "Pooja123",
  "Arjun123",
  "Neha123",
  "Karthik123",
  "Nisha123",
  "Siddharth123",
  "Ishita123",
  "Varun123",
  "Aditi123",
  "Rakesh123",
  "Shruti123",
  "Nitin123",
  "Bhavana123",
  "Manish123",
  "Keerthi123",

  // HR Department
  "Divya123",
  "Akash123",
  "Shreya123",
  "Ritu123",
  "Sanjay123",
  "Pallavi123",

  // Finance Department
  "Harish123",
  "Sanjana123",
  "Deepak123",
  "Rohit123",
  "Naveen123",
  "Swathi123",

  // Marketing Department
  "Kavya123",
  "Aditya123",
  "Ritika123",
  "Manoj123",
  "Tanvi123",
  "Rahul123",
  "Nikhil123",
  "Preethi123",
  "Ashwin123",
  "Monika123"
];

passwords.forEach(password => {
  console.log(password, "=>", bcrypt.hashSync(password, 10));
});