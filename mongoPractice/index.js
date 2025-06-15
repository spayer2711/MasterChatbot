const express = require('express');
const mongoose = require('mongoose');
// require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection
// user : spayer2711
// password: teqfXF19m1kknnvl
mongoose.connect("mongodb+srv://spayer2711:teqfXF19m1kknnvl@cluster0.xf10m.mongodb.net/Employee?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Define a Mongoose schema and model
const EmployeeSchema = new mongoose.Schema({
    name: String,
    email: String,
    age: Number
},{ collection: 'Employee' });

const EmployeeModel = mongoose.model('Employee', EmployeeSchema);

// Route to fetch data from MongoDB
app.get('/api/employee', async (req, res) => {
    try {
        const employees = await EmployeeModel.find();
        console.log('Fetched Employees:', employees);
        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.use(express.json()); // ✅ Middleware to parse JSON request body

// POST route to add a new employee
app.post('/api/employees', async (req, res) => {
    try {
        const { name, age, department, salary } = req.body; // Extract data from request body

        // ✅ Validate data before saving
        if (!name || !age || !department || !salary) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newEmployee = new EmployeeModel({ name, age, department, salary });
        await newEmployee.save(); // Save data to MongoDB

        console.log('New Employee Added:', newEmployee);
        res.status(201).json(newEmployee); // Send response with new employee data
    } catch (error) {
        console.error('Error adding employee:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
