const supabase = require("../Supabase/supabaseServer");
const supabaseModel = require("./supabaseModel");

// Authentication functions
exports.signUp = async (email, password) => {
  return await supabaseModel.signUp(email, password);
};

exports.signIn = async (email, password) => {
  return await supabaseModel.signIn(email, password);
};

exports.signOut = async () => {
  return await supabaseModel.signOut();
};

exports.resetPassword = async (email, redirectUrl) => {
  return await supabaseModel.resetPassword(email, redirectUrl);
};

exports.updatePassword = async (newPassword) => {
  return await supabaseModel.updatePassword(newPassword);
};

exports.getUser = async () => {
  return await supabaseModel.getUser();
};

exports.updateUserMetadata = async (metadata) => {
  return await supabaseModel.updateUserMetadata(metadata);
};

// User data functions
exports.insertUserData = async (table, userData) => {
  return await supabaseModel.insertUserData(table, userData);
};

exports.getUserData = async (table, userId) => {
  return await supabaseModel.getUserData(table, userId);
};

exports.updateUserData = async (table, userId, updates) => {
  return await supabaseModel.updateUserData(table, userId, updates);
};

exports.deleteUserData = async (table, userId) => {
  return await supabaseModel.deleteUserData(table, userId);
};

// Google Sign-In
exports.signInWithGoogle = async (redirectUrl) => {
  return await supabaseModel.signInWithGoogle(redirectUrl);
};

// Verify security PIN
exports.verifySecurityPin = async (role, pin) => {
  return await supabaseModel.verifySecurityPin(role, pin);
};
