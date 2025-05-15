const { createClient } = require("@supabase/supabase-js");
require("dotenv").config()

const Project_URL = process.env.PROJECT_URL;
const Api_Key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(Project_URL,Api_Key);
module.exports = supabase;