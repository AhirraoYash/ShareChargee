const Vehicle = require('../models/vehicle');
const User = require('../models/user');

// Add a new vehicle
const addVehicle = async (req, res) => {
  try {
    const { type, numberPlate, model, brand, batteryCapacityKWH } = req.body;
    // Create a new vehicle entry
    const vehicle = new Vehicle({
      user: req.user.userId,
      type,
      numberPlate,
      model,
      brand,
      batteryCapacityKWH
    });
    
    // Save the vehicle to the database
    const savedVehicle = await vehicle.save();

    // Add vehicle reference to user's vehicles array
    await User.findByIdAndUpdate(
      req.user.userId,
      { $push: { vehicles: savedVehicle._id } },
      { new: true }
    );
   
    res.status(201).json({ message: "Vehicle added successfully", vehicle: savedVehicle });
  } catch (error) {
    console.error("Error adding vehicle:", error.message);
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: "This number plate is already registered" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch all vehicles of the logged-in user
const getVehicles = async (req, res) => {
  try {
    // Fetch vehicles associated with the logged-in user
    const vehicles = await Vehicle.find({ user: req.user.userId });
    if (!vehicles) {
      return res.status(404).json({ message: "No vehicles found" });
    }

    res.status(200).json({ success: true, vehicles });
  } catch (error) {
    console.error("Error fetching vehicles:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch a specific vehicle by its number plate
const getVehicleByNumberPlate = async (req, res) => {
  const { numberPlate } = req.params;

  try {
    const vehicle = await Vehicle.findOne({ numberPlate, user: req.user.userId });
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json({ success: true, vehicle });
  } catch (error) {
    console.error("Error fetching vehicle:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a vehicle's details
const updateVehicle = async (req, res) => {
  const { vehicleId } = req.params;
  const { type, numberPlate, model, brand, batteryCapacityKWH } = req.body;

  try {
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: vehicleId, user: req.user.userId },
      { type, numberPlate, model, brand, batteryCapacityKWH },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found or you do not have permission to update" });
    }

    res.status(200).json({ message: "Vehicle updated successfully", vehicle });
  } catch (error) {
    console.error("Error updating vehicle:", error.message);
    if (error.code === 11000) {
      return res.status(400).json({ message: "This number plate is already registered" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a vehicle
const deleteVehicle = async (req, res) => {
  const { vehicleId } = req.params;

  try {
    // First find the vehicle to make sure it exists and belongs to the user
    const vehicle = await Vehicle.findOne({ _id: vehicleId, user: req.user.userId });
    
    if (!vehicle) {
      return res.status(404).json({ 
        message: "Vehicle not found or you do not have permission to delete" 
      });
    }

    // Delete the vehicle
    await Vehicle.findByIdAndDelete(vehicleId);

    // Remove vehicle reference from user's vehicles array
    await User.findByIdAndUpdate(
      req.user.userId,
      { $pull: { vehicles: vehicleId } }
    );

    res.status(200).json({ 
      success: true,
      message: "Vehicle deleted successfully",
      deletedVehicleId: vehicleId
    });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete vehicle" 
    });
  }
};

module.exports = { addVehicle, getVehicles, getVehicleByNumberPlate, updateVehicle, deleteVehicle };
