const supabaseModel = require("../Models/supabaseModel");

module.exports.HOD = async (req, res) => {
    const { department } = req.query;

    try {
        const { data, error } = await supabaseModel.getHODs(department);

        if (error) {
            console.log(error)
            return res.status(500).json({ error: "Database error", details: error.message });
        }

        return res.status(200).json({ hodsData: data });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};