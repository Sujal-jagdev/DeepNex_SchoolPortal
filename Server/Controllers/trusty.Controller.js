const supabaseModel = require("../Models/supabaseModel");

module.exports.GET_HODS = async (req, res) => {
    const { department } = req.query;

    try {
        const { data, error } = await supabaseModel.getHODs(department);

        if (error) {
            return res.status(500).json({ error: "Database error", details: error.message });
        }

        return res.status(200).json({ hodsData: data });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports.UPDATE_HOD = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
        return res.status(400).json({ message: "Please provide a HOD ID!" });
    }

    try {
        const { data, error } = await supabaseModel.updateHOD(id, updateData);

        if (error) {
            
            if (error.message === "HOD not found with this ID") {
                return res.status(404).json({ message: error.message });
            }
            return res.status(500).json({ message: "Database error", error: error.message });
        }

        return res.status(200).json({
            message: "HOD updated successfully",
            updatedHod: data
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports.DELETE_HOD = async (req, res) => {
    const { id } = req.params;
    
    if (!id) {
        return res.status(400).json({ message: "Please provide a HOD ID to delete!" });
    }

    try {
        const { error } = await supabaseModel.deleteHOD(id);

        if (error) {
            if (error.message === "HOD not found with this ID") {
                return res.status(404).json({ message: error.message });
            }
            return res.status(500).json({ message: "Database error", error: error.message });
        }

        return res.status(200).json({ message: "HOD deleted successfully!" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Student routes handlers
module.exports.GET_STUDENTS = async (req, res) => {
    try {
        const { data, error } = await supabaseModel.getStudents();

        if (error) {
            return res.status(500).json({ error: "Database error", details: error.message });
        }

        return res.status(200).json({ studentsData: data });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports.UPDATE_STUDENT = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
        return res.status(400).json({ message: "Please provide a student ID!" });
    }

    try {
        const { data, error } = await supabaseModel.updateStudent(id, updateData);

        if (error) {
            return res.status(500).json({ message: "Database error", error: error.message });
        }

        return res.status(200).json({
            message: "Student updated successfully",
            updatedStudent: data
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports.DELETE_STUDENT = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "Please provide a student ID to delete!" });
    }

    try {
        const { error } = await supabaseModel.deleteStudent(id);

        if (error) {
            return res.status(500).json({ message: "Database error", error: error.message });
        }

        return res.status(200).json({ message: "Student deleted successfully!" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Teacher routes handlers
module.exports.GET_TEACHERS = async (req, res) => {
    try {
        const { data, error } = await supabaseModel.getTeachers();

        if (error) {
            return res.status(500).json({ error: "Database error", details: error.message });
        }

        return res.status(200).json({ teachersData: data });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports.UPDATE_TEACHER = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
        return res.status(400).json({ message: "Please provide a teacher ID!" });
    }

    try {
        const { data, error } = await supabaseModel.updateTeacher(id, updateData);

        if (error) {
            return res.status(500).json({ message: "Database error", error: error.message });
        }

        return res.status(200).json({
            message: "Teacher updated successfully",
            updatedTeacher: data
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports.DELETE_TEACHER = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "Please provide a teacher ID to delete!" });
    }

    try {
        const { error } = await supabaseModel.deleteTeacher(id);

        if (error) {
            return res.status(500).json({ message: "Database error", error: error.message });
        }

        return res.status(200).json({ message: "Teacher deleted successfully!" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Admin routes handlers
module.exports.GET_ADMINS = async (req, res) => {
    try {
        const { data, error } = await supabaseModel.getAdmins();

        if (error) {
            return res.status(500).json({ error: "Database error", details: error.message });
        }

        return res.status(200).json({ adminsData: data });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports.UPDATE_ADMIN = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
        return res.status(400).json({ message: "Please provide an admin ID!" });
    }

    try {
        const { data, error } = await supabaseModel.updateAdmin(id, updateData);

        if (error) {
            return res.status(500).json({ message: "Database error", error: error.message });
        }

        return res.status(200).json({
            message: "Admin updated successfully",
            updatedAdmin: data
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports.DELETE_ADMIN = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "Please provide an admin ID to delete!" });
    }

    try {
        const { error } = await supabaseModel.deleteAdmin(id);

        if (error) {
            return res.status(500).json({ message: "Database error", error: error.message });
        }

        return res.status(200).json({ message: "Admin deleted successfully!" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get all departments
module.exports.GET_DEPARTMENTS = async (req, res) => {
    try {
        const { data, error } = await supabaseModel.getDepartments();

        if (error) {
            return res.status(500).json({ error: "Database error", details: error.message });
        }

        return res.status(200).json({ departments: data });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
