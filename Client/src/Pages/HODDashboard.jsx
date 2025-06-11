import { supabase } from "../helper/supabaseClient";
import {
  Home,
  Users,
  FileText,
  LogOut,
  Plus,
  Search,
  AlertCircle,
  Clock,
  Check,
  X,
  MessageSquare,
  Award,
  Layers,
  Eye,
  User,
  Trash2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  UserX,
} from "react-feather";
import {
  GraduationCap,
  School,
  BookOpen,
  ClipboardList,
  Shield,
  UserCog,
  CheckCircle,
  ChevronsUpDown,
  Pencil,
} from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import React, { useState, useEffect, useRef, useContext } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { toast } from "react-toastify";
import { MyContext } from "../AllContext";
import DefaultUserImage from "../assets/DefaultUser.webp"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const HODDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [departmentStats, setDepartmentStats] = useState(null);
  const [teacherPerformance, setTeacherPerformance] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 6;
  const { role } = useContext(MyContext);
  const [hodsData, setHodsData] = useState([]);
  const [teachersData, setTeachersData] = useState([]);

  // Mobile responsive states
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Teacher approval states
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalDecision, setApprovalDecision] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [teachersPerPage, setTeachersPerPage] = useState(6);

  // Add Teacher Modal states
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [newTeacherData, setNewTeacherData] = useState({
    fullname: "",
    email: "",
    highest_qualification: "",
    subject_expertise: "",
    experience: "",
    bio: "",
    teaching_level: "",
    status: "pending",
  });
  const [addTeacherLoading, setAddTeacherLoading] = useState(false);

  // For scroll animations
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;

      // Fetch admin data
      const { data: admin, error: adminError } = await supabase
        .from("admin")
        .select("*");

      if (adminError) throw adminError;

      // Fetch teacher data
      const { data: teachers, error: teacherError } = await supabase
        .from("teacher")
        .select("*");

      if (teacherError) throw teacherError;

      // Fetch student data
      const { data: students, error: studentError } = await supabase
        .from("student")
        .select("*");

      if (studentError) throw studentError;
      setStudentData(students);

      // Fetch HOD data
      const { data: hods, error: hodsError } = await supabase
        .from("hod")
        .select("*");

      if (hodsError) throw hodsError;
      setHodsData(hods || []);

      if (role === "teacher") {
        const currentTeacher = teachers.find((t) => t.email === authUser.email);
        setAdminData(currentTeacher ? [currentTeacher] : []);
      } else if (role === "hod") {
        const currentHod = hods.find((h) => h.email === authUser.email);
        setAdminData(currentHod ? [currentHod] : []);
      } else if (role == "admin") {
        const currentAdmin = admin.find((a) => a.email === authUser.email);
        setAdminData(currentAdmin ? [currentAdmin] : []);
      }

      // Fetch pending teacher approvals
      const { data: approvals, error: approvalError } = await supabase
        .from("teacher_approvals")
        .select("*")
        .eq("status", "pending");

      if (approvalError) throw approvalError;
      setPendingApprovals(approvals || []);

      // Calculate department stats
      const stats = {
        totalTeachers: teachers.length,
        activeTeachers: teachers.filter((t) => t.status === "active").length,
        pendingTeachers: teachers.filter((t) => t.status === "pending").length,
        students: students.length,
        hods: hods?.length || 0,
        departments:
          [...new Set(hods?.map((hod) => hod.department_expertise))].length ||
          0,
      };
      setDepartmentStats(stats);

      // Format teacher performance data
      const performanceData = teachers.map((teacher) => ({
        id: teacher.id,
        name: teacher.fullname,
        email: teacher.email,
        students: teacher.students || Math.floor(Math.random() * 30) + 20,
        qualification: teacher.highest_qualification,
        subject: teacher.subject_expertise,
        experience: teacher.experience,
        bio: teacher.bio,
        teaching_level: teacher.teaching_level,
        status: teacher.status,
        approved_at: teacher.approved_at,
        approved_by: teacher.approved_by,
      }));
      setTeacherPerformance(performanceData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Helper function to count occurrences by property
  const countByProperty = (data, property) => {
    return data.reduce((acc, item) => {
      const key = item[property];
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  };

  const filteredTeachers = teacherPerformance.filter(teacher =>
    (teacher.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (teacher.subject?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (teacher.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const filteredStudents = studentData.filter(student =>
    (student.fullname?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (student.roll_no?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const filteredHods = hodsData.filter(hod =>
    (hod.fullname?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (hod.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (hod.department_expertise?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const handleView = (teacher) => {
    setEditingTeacher(teacher);
    setIsEditing(false);
  };

  const handleEdit =
    role == "teacher"
      ? ""
      : (teacher) => {
        setEditingTeacher(teacher);
        setIsEditing(true);
      };

  // Teacher approval functions
  const handleViewApproval = (approval) => {
    setSelectedApproval(approval);
    setShowApprovalModal(true);
    setApprovalDecision(null);
    setRejectionReason("");
  };

  const handleApproveTeacher = async () => {
    try {
      setApprovalLoading(true);

      // Update approval status
      const { error: approvalError } = await supabase
        .from('teacher_approvals')
        .update({
          status: 'approved',
          decided_at: new Date().toISOString(),
          decided_by: adminData.id
        })
        .eq('id', selectedApproval.id);

      if (approvalError) throw approvalError;

      // Update or create teacher record
      const { data: existingTeacher, error: checkError } = await supabase
        .from('teacher')
        .select('id')
        .eq('email', selectedApproval.teacher_email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existingTeacher) {
        // Update existing teacher
        const { error: teacherError } = await supabase
          .from('teacher')
          .update({
            status: 'active',
            approved_by: adminData.id,
            approved_at: new Date().toISOString()
          })
          .eq('id', existingTeacher.id);

        if (teacherError) throw teacherError;
      } else {
        // Create new teacher
        const { error: teacherError } = await supabase
          .from('teacher')
          .insert({
            email: selectedApproval.teacher_email,
            status: 'active',
            approved_by: adminData.id,
            approved_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            fullname: selectedApproval.fullname,
            avatar_url: selectedApproval.avatar_url
          });

        if (teacherError) throw teacherError;
      }

      // Update UI
      setPendingApprovals(pendingApprovals.filter(a => a.id !== selectedApproval.id));
      toast.success("Teacher approved successfully!");
      setShowApprovalModal(false);

    } catch (error) {
      console.error("Approval error:", error);
      toast.error(error.message || "Failed to approve teacher");
    } finally {
      setApprovalLoading(false);
    }
  };

  // const handleRejectTeacher = async () => {
  //   try {
  //     setApprovalLoading(true);

  //     if (!rejectionReason?.trim()) {
  //       throw new Error("Rejection reason is required");
  //     }

  //     // Update approval status with rejection reason
  //     const { error: updateError } = await supabase
  //       .from('teacher_approvals')
  //       .update({
  //         status: 'rejected',
  //         decided_at: new Date().toISOString(),
  //         decided_by: adminData.id,
  //         rejection_reason: rejectionReason
  //       })
  //       .eq('id', selectedApproval.id);

  //     if (updateError) throw updateError;

  //     // Send rejection notification
  //     try {
  //       await sendTeacherNotification(
  //         selectedApproval.teacher_id,
  //         "rejected",
  //         `Your teacher registration was rejected. Reason: ${rejectionReason}`
  //       );
  //     } catch (notificationError) {
  //       console.error("Notification failed:", notificationError);
  //     }

  //     // Update UI
  //     setPendingApprovals(pendingApprovals.filter(a => a.id !== selectedApproval.id));
  //     toast.success("Teacher rejected successfully!");
  //     setShowApprovalModal(false);

  //   } catch (error) {
  //     console.error("Rejection error:", error);
  //     toast.error(error.message || "Failed to reject teacher");
  //   } finally {
  //     setApprovalLoading(false);
  //   }
  // };

  const handleRejectTeacher = async () => {
    try {
      setApprovalLoading(true);

      if (!rejectionReason?.trim()) {
        throw new Error("Rejection reason is required");
      }

      // 1. First get teacher details
      const { data: approvalData, error: fetchError } = await supabase
        .from('teacher_approvals')
        .select('teacher_email, teacher_id')
        .eq('id', selectedApproval.id)
        .single();

      if (fetchError) throw fetchError;

      // 2. Delete from teacher table if exists (but keep in teacher_approvals)
      const { error: deleteTeacherError } = await supabase
        .from('teacher')
        .delete()
        .eq('email', approvalData.teacher_email);

      if (deleteTeacherError && deleteTeacherError.code !== 'PGRST116') {
        throw deleteTeacherError;
      }

      // 3. Remove from authentication system
      try {
        const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
        const userToDelete = authUser.users.find(user => user.email === approvalData.teacher_email);

        if (userToDelete) {
          await supabase.auth.admin.deleteUser(userToDelete.id);
        }
      } catch (authDeleteError) {
        console.error("Failed to delete auth user:", authDeleteError);
        // Continue even if auth deletion fails
      }

      // 4. Update approval record (instead of deleting)
      const { error: updateApprovalError } = await supabase
        .from('teacher_approvals')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          decided_at: new Date().toISOString(),
          decided_by: adminData.id
        })
        .eq('id', selectedApproval.id);

      if (updateApprovalError) throw updateApprovalError;

      // 5. Send rejection notification
      try {
        await sendTeacherNotification(
          approvalData.teacher_id,
          "rejected",
          `Your teacher registration was rejected. Reason: ${rejectionReason}`
        );
      } catch (notificationError) {
        console.error("Notification failed:", notificationError);
      }

      // Update UI state
      setPendingApprovals(pendingApprovals.filter(a => a.id !== selectedApproval.id));
      toast.success("Teacher application rejected and access revoked");
      setShowApprovalModal(false);

    } catch (error) {
      console.error("Rejection error:", error);
      toast.error(error.message || "Failed to reject teacher");
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleNewTeacherChange = (e) => {
    const { name, value } = e.target;
    setNewTeacherData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setAddTeacherLoading(true);

    try {
      // 1. Create auth user with email
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newTeacherData.email,
        password:
          Math.random().toString(36).slice(-8) +
          Math.random().toString(36).toUpperCase().slice(-4) +
          "!1", // Generate a random secure password
      });

      if (authError) throw authError;

      // 2. Add teacher to the teacher table
      const teacherId = authData.user.id;
      const { error: teacherError } = await supabase.from("teacher").insert([
        {
          id: teacherId,
          fullname: newTeacherData.fullname,
          email: newTeacherData.email,
          highest_qualification: newTeacherData.highest_qualification,
          subject_expertise: newTeacherData.subject_expertise,
          experience: newTeacherData.experience,
          bio: newTeacherData.bio,
          teaching_level: newTeacherData.teaching_level,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ]);

      if (teacherError) throw teacherError;

      // 3. Create approval record
      const { error: approvalError } = await supabase
        .from("teacher_approvals")
        .insert([
          {
            teacher_id: teacherId,
            status: "pending",
            created_at: new Date().toISOString(),
          },
        ]);

      if (approvalError) throw approvalError;

      // 4. Update local state
      const newTeacher = {
        id: teacherId,
        name: newTeacherData.fullname,
        email: newTeacherData.email,
        qualification: newTeacherData.highest_qualification,
        subject: newTeacherData.subject_expertise,
        experience: newTeacherData.experience,
        bio: newTeacherData.bio,
        teaching_level: newTeacherData.teaching_level,
        status: "pending",
      };

      setTeacherPerformance((prev) => [...prev, newTeacher]);
      setPendingApprovals((prev) => [
        ...prev,
        {
          id: Date.now(), // Temporary ID for UI
          teacher_id: teacherId,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ]);

      setDepartmentStats((prev) => ({
        ...prev,
        totalTeachers: (prev?.totalTeachers || 0) + 1,
        pendingTeachers: (prev?.pendingTeachers || 0) + 1,
      }));

      // 5. Reset form and close modal
      setNewTeacherData({
        fullname: "",
        email: "",
        highest_qualification: "",
        subject_expertise: "",
        experience: "",
        bio: "",
        teaching_level: "",
        status: "pending",
      });
      setShowAddTeacherModal(false);
      toast.success("Teacher added successfully! Awaiting approval.");
    } catch (error) {
      console.error("Error adding teacher:", error);
      toast.error(error.message || "Failed to add teacher");
    } finally {
      setAddTeacherLoading(false);
    }
  };

  // Modify your sendTeacherNotification to better handle empty errors
  const sendTeacherNotification = async (teacherId, type, message) => {
    try {
      const notificationData = {
        user_id: teacherId,
        type,
        message,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("notifications")
        .insert([notificationData])
        .select();

      if (error) {
        // Enhanced error logging
        const errorDetails = {
          errorMessage: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          teacherId,
          type,
          message,
        };
        console.error("Supabase notification error:", errorDetails);
        throw new Error(error.message || "Failed to send notification");
      }

      return data;
    } catch (err) {
      // More detailed error logging
      const errorInfo = {
        name: err.name,
        errorMessage: err.message,
        stack: err.stack,
        teacherId,
        type,
        message,
        timestamp: new Date().toISOString(),
      };
      console.error("Notification system error:", errorInfo);
      throw err;
    }
  };

  function ViewProfile({ data, type, onEdit }) {

    const profileType = data?.roll_no
      ? "student"
      : data?.department_expertise
        ? "hod"
        : "teacher";

    const fields =
      profileType === "teacher"
        ? [
          { label: "Name", value: data.name },
          { label: "Subject", value: data.subject },
          { label: "Email", value: data.email },
          { label: "Qualification", value: data.qualification },
          { label: "Experience", value: `${data.experience} years` },
          { label: "Bio", value: data.bio },
          { label: "Teaching Level", value: data.teaching_level }
        ]
        : profileType === "student"
          ? [
            { label: "Name", value: data.fullname },
            { label: "Email", value: data.email },
            { label: "Roll Number", value: data.roll_no },
            { label: "Standard", value: data.std },
            { label: "Phone Number", value: data.phonenumber },
            { label: "Total Messages", value: data.message_count },
            ...(data.stream ? [{ label: "Stream", value: data.stream }] : []),
            { label: "Address", value: data.address },
          ]
          : [
            { label: "Full Name", value: data.fullname },
            { label: "Email", value: data.email },
            { label: "Phone Number", value: data.phonenumber },
            { label: "Department Expertise", value: data.department_expertise },
            { label: "Vision Department", value: data.vision_department },
            { label: "Qualification", value: data.highest_qualification },
            { label: "Experience", value: `${data.experience} years` },
          ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl overflow-y-scroll overflow-x-hidden p-6 hover:shadow-lg h-110"
      >
        <motion.h2
          className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2"
          whileHover={{ scale: 1.01 }}
        >
          {type === "teacher" ? "Teacher" : "Student"} Profile
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {fields.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
              className="bg-gray-50 p-4 rounded-lg"
            >
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-1">
                {item.label}
              </p>
              <p className="text-lg font-medium text-gray-800">
                {item.value || (
                  <span className="text-gray-400">
                    {item.value == 0 ? 0 : "Not specified"}
                  </span>
                )}
              </p>
            </motion.div>
          ))}
        </div>

        {role == "teacher" ? (
          ""
        ) : (
          <div className="flex justify-end space-x-3 border-t pt-6">
            <motion.button
              onClick={onEdit}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Edit Profile
            </motion.button>
          </div>
        )}
      </motion.div>
    );
  }

  function EditForm({ data, type, onSave, onCancel }) {
    const [formData, setFormData] = useState(data);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData, type);
    };

    const fields =
      type === "teacher"
        ? [
          { label: "Name", name: "name", type: "text" },
          { label: "Subject", name: "subject", type: "text" },
          { label: "Email", name: "email", type: "email" },
          { label: "Qualification", name: "qualification", type: "text" },
          { label: "Experience (years)", name: "experience", type: "number" },
          { label: "Bio", name: "bio", type: "textarea" },
          { label: "Teaching Level", name: "teaching_level", type: "text" },
        ]
        : type === "student"
          ? [
            { label: "Full Name", name: "fullname", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Roll Number", name: "roll_no", type: "text" },
            { label: "Standard", name: "std", type: "text" },
            { label: "Phone Number", name: "phonenumber", type: "text" },
            { label: "Address", name: "address", type: "text" },
          ]
          : [
            { label: "Full Name", name: "fullname", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Phone Number", name: "phonenumber", type: "text" },
            { label: "Department", name: "department_expertise", type: "text" },
            {
              label: "Vision Department",
              name: "vision_department",
              type: "text",
            },
            {
              label: "Qualification",
              name: "highest_qualification",
              type: "text",
            },
            { label: "Experience", name: "experience", type: "number" },
          ];

    return (
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl h-110 overflow-y-scroll overflow-x-hidden"
      >
        <motion.h2
          className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100"
          whileHover={{ x: 5 }}
        >
          Edit {type === "teacher" ? "Teacher" : "Student"} Profile
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {fields.map((field, index) => (
            <motion.div
              key={field.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="space-y-1"
            >
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                <span className="text-red-500">*</span>
              </label>
              {field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-gray-400"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  required
                  rows={3}
                />
              ) : (
                <motion.input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  whileFocus={
                    field.name === "email"
                      ? {}
                      : {
                        scale: 1.02,
                        boxShadow: "0 0 0 2px rgba(79, 70, 229, 0.5)",
                      }
                  }
                  className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-gray-400 ${field.name === "email"
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                    }`}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  required
                  disabled={field.name === "email"}
                  readOnly={field.name === "email"}
                />
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          className="flex justify-end space-x-3 pt-4 border-t border-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.05, backgroundColor: "#f9fafb" }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.3)",
            }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Save Changes
          </motion.button>
        </motion.div>
      </motion.form>
    );
  }

  const handleSave = async (updatedData, type) => {
    try {
      if (type === "teacher") {
        // Update teacher in state (excluding email)
        const updatedTeachers = teacherPerformance.map((teacher) =>
          teacher.id === updatedData.id
            ? {
              ...teacher,
              name: updatedData.name,
              subject: updatedData.subject,
              qualification: updatedData.qualification,
              experience: updatedData.experience,
              bio: updatedData.bio,
              teaching_level: updatedData.teaching_level,
            }
            : teacher
        );
        setTeacherPerformance(updatedTeachers);

        // Update in Supabase (excluding email)
        const { error } = await supabase
          .from("teacher")
          .update({
            fullname: updatedData.name,
            subject_expertise: updatedData.subject,
            highest_qualification: updatedData.qualification,
            experience: updatedData.experience,
            bio: updatedData.bio,
            teaching_level: updatedData.teaching_level,
          })
          .eq("id", updatedData.id);

        if (error) throw error;
      } else if (type === "student") {
        // Update student in state (excluding email)
        const updatedStudents = studentData.map((student) =>
          student.id === updatedData.id
            ? {
              ...student,
              fullname: updatedData.fullname,
              roll_no: updatedData.roll_no,
              std: updatedData.std,
              division: updatedData.division,
              phonenumber: updatedData.phonenumber,
              address: updatedData.address,
            }
            : student
        );
        setStudentData(updatedStudents);

        // Update in Supabase (excluding email)
        const { error } = await supabase
          .from("student")
          .update({
            fullname: updatedData.fullname,
            roll_no: updatedData.roll_no,
            std: updatedData.std,
            division: updatedData.division,
            phonenumber: updatedData.phonenumber,
            address: updatedData.address,
          })
          .eq("id", updatedData.id);

        if (error) throw error;
      } else {
        // HOD update logic
        if (updatedData.id) {
          // Update existing HOD
          const { error } = await supabase
            .from("hod")
            .update({
              fullname: updatedData.fullname,
              email: updatedData.email,
              phonenumber: updatedData.phonenumber,
              department_expertise: updatedData.department_expertise,
              vision_department: updatedData.vision_department,
              highest_qualification: updatedData.highest_qualification,
              experience: updatedData.experience,
            })
            .eq("id", updatedData.id);

          if (error) throw error;

          // Update local state with merged data
          setHodsData(
            hodsData.map((hod) =>
              hod.id === updatedData.id ? { ...hod, ...updatedData } : hod
            )
          );
        } else {
          // Create new HOD
          const { data, error } = await supabase
            .from("hod")
            .insert([
              {
                fullname: updatedData.fullname,
                email: updatedData.email,
                phonenumber: updatedData.phonenumber,
                department_expertise: updatedData.department_expertise,
                vision_department: updatedData.vision_department,
                highest_qualification: updatedData.highest_qualification,
                experience: updatedData.experience,
              },
            ])
            .select();

          if (error) throw error;

          setHodsData([...hodsData, data[0]]);
        }
      }

      setEditingTeacher(null);
      setIsEditing(false);
      toast.success(
        `${type === "teacher"
          ? "Teacher"
          : type === "student"
            ? "Student"
            : "HOD"
        } ${updatedData.id ? "updated" : "added"} successfully!`
      );
    } catch (error) {
      toast.error(
        `Failed to ${updatedData.id ? "update" : "add"} ${type === "teacher"
          ? "teacher"
          : type === "student"
            ? "student"
            : "HOD"
        }`
      );
      console.error("Error:", error);
    }
  };

  const handleDelete = async (tableName, id, setData, data) => {
    if (
      window.confirm(
        `Are you sure you want to delete this ${tableName.toUpperCase()}?`
      )
    ) {
      try {
        const { error } = await supabase.from(tableName).delete().eq("id", id);

        if (error) throw error;

        setData(data.filter((item) => item.id !== id));
        const { error: authError } = await supabase.auth.admin.deleteUser(id);

        if (authError) {
          console.log(authError)
          // Rollback suggestion if auth fails but DB succeeded
          await supabase.from(tableName).insert({ id: id }); // Re-insert with same ID (simplified example)
          toast.success(
            `${tableName.toUpperCase()} Auth deletion failed - rolled back DB`
          );
        }
        toast.success(`${tableName.toUpperCase()} Deleted Successfully`);
      } catch (error) {
        toast.error(`Failed to delete ${tableName}`);
        console.error("Delete error:", error);
      }
    }
  };

  // Calculate Current Records
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

  // Get current records for both teachers and students
  const currentTeachers = filteredTeachers.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const currentStudents = filteredStudents.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const currentHods = filteredHods.slice(indexOfFirstRecord, indexOfLastRecord);


  // Calculate total pages
  const totalPagesTeachers = Math.ceil(
    filteredTeachers.length / recordsPerPage
  );
  const totalPagesStudents = Math.ceil(
    filteredStudents.length / recordsPerPage
  );
  const totalPagesHods = Math.ceil(filteredHods.length / recordsPerPage);


  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="animate-pulse flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 1.5,
              ease: "easeInOut",
            }}
            className="h-32 w-32 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full mb-4"
          ></motion.div>
          <div className="h-6 w-64 bg-gradient-to-r from-indigo-200 to-purple-200 rounded mb-2"></div>
          <div className="h-4 w-48 bg-gradient-to-r from-indigo-200 to-purple-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden"
    >
      {/* Mobile Header - Only visible on small screens */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-40 shadow-md">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-md text-indigo-600 hover:bg-indigo-50 focus:outline-none"
            aria-label="Open menu"
          >
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="flex items-center space-x-2">
            <School size={24} className="text-indigo-600" />
            <h1 className="text-lg font-bold text-gray-800">
              {role === "teacher"
                ? "Teacher"
                : role === "hod"
                  ? "HOD"
                  : "Admin"}{" "}
              Dashboard
            </h1>
          </div>
          <div className="w-8"></div> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 text-white shadow-xl z-50 transform transition-all duration-300 ease-in-out ${isMobileView
          ? isMobileSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
          : "translate-x-0"
          } md:z-30 md:translate-x-0 pt-10`}
      >
        {/* Header */}
        <div classNa me="p-6 flex items-center justify-between border-b border-indigo-700/50">
          <div className="flex items-center space-x-3">
            <School size={28} className="text-indigo-300 animate-pulse" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
              EduManage
            </h1>
          </div>
        </div>

        {/* Profile Section */}
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-8 group">
            <div className="relative">
              <img
                src={
                  adminData[0]?.avatar_url ||
                  DefaultUserImage
                }
                alt="Profile"
                className="w-12 h-12 rounded-full border-2 border-indigo-300 group-hover:border-indigo-200 transition-all duration-300 object-cover"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-indigo-900 animate-pulse"></div>
            </div>
            <div className="overflow-hidden">
              <h2 className="font-semibold truncate">
                {adminData[0]?.fullname}
              </h2>
              <p className="text-sm text-indigo-300/80 group-hover:text-indigo-200 transition-colors">
                {role == "teacher"
                  ? "Teacher Dashboard"
                  : role == "hod"
                    ? "HOD Dashboard"
                    : role == "admin" ? "Admin Panel" : ''}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === "dashboard"
                ? "bg-indigo-700/90 text-white shadow-md"
                : "text-indigo-200 hover:bg-indigo-800/80 hover:translate-x-1"
                }`}
            >
              <Home size={18} className="mr-3 flex-shrink-0" />
              <span className="truncate">Dashboard</span>
              {pendingApprovals.length > 0 && activeTab !== "dashboard" && (
                <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-bounce">
                  {pendingApprovals.length}
                </span>
              )}
            </button>

            {role !== "teacher" && (
              <button
                onClick={() => setActiveTab("teachers")}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === "teachers"
                  ? "bg-indigo-700/90 text-white shadow-md"
                  : "text-indigo-200 hover:bg-indigo-800/80 hover:translate-x-1"
                  }`}
              >
                <Users size={18} className="mr-3 flex-shrink-0" />
                <span className="truncate">Teacher Department</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("students")}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === "students"
                ? "bg-indigo-700/90 text-white shadow-md"
                : "text-indigo-200 hover:bg-indigo-800/80 hover:translate-x-1"
                }`}
            >
              <GraduationCap size={18} className="mr-3 flex-shrink-0" />
              <span className="truncate">Student Department</span>
            </button>

            {role === "admin" && (
              <button
                onClick={() => setActiveTab("hods")}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === "hods"
                  ? "bg-indigo-700/90 text-white shadow-md"
                  : "text-indigo-200 hover:bg-indigo-800/80 hover:translate-x-1"
                  }`}
              >
                <UserCog size={18} className="mr-3 flex-shrink-0" />
                <span className="truncate">HOD Management</span>
              </button>
            )}

            {role !== "teacher" && (
              <button
                onClick={() => setActiveTab("approvals")}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === "approvals"
                  ? "bg-indigo-700/90 text-white shadow-md"
                  : "text-indigo-200 hover:bg-indigo-800/80 hover:translate-x-1"
                  }`}
              >
                <ClipboardList size={18} className="mr-3 flex-shrink-0" />
                <span className="truncate">Approvals</span>
                {pendingApprovals.length > 0 && (
                  <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">
                    {pendingApprovals.length}
                  </span>
                )}
              </button>
            )}
          </nav>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-indigo-700/50">
          <button
            className="flex items-center w-full px-4 py-3 rounded-lg text-indigo-200 hover:bg-indigo-800/80 hover:text-white transition-all duration-200 group"
            onClick={async () => {
              await supabase.auth.signOut();  
              window.location.href = "/login";
            }}
          >
            <LogOut
              size={18}
              className="mr-3 flex-shrink-0 group-hover:animate-pulse"
            />
            <span className="truncate">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Button - Only visible on small screens */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <motion.button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mt-16 -ms-5 rounded-l-none transition-all duration-300 ease-in-out flex items-center justify-center"
          aria-label="Toggle menu"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {isMobileSidebarOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 min-h-screen transition-all duration-300 pt-16 md:pt-0">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-20 sticky top-0">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-4 sm:px-6 py-4 pt-4 md:pt-10">
            {/* Title Section */}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate max-w-full ps-12">
              {activeTab === "dashboard" && role === "teacher"
                ? "Teacher Dashboard"
                : role === "hod"
                  ? "HOD Dashboard"
                  : role == "admin" ? "Admin Panel" : ""}
              {activeTab === "teachers" && " Teacher Management"}
              {activeTab === "students" && " Student Management"}
              {activeTab === "hods" && " HOD Management"}
              {activeTab === "approvals" && " Teacher Approvals"}
            </h1>

            {/* Search Bar - Conditionally Rendered */}
            {activeTab !== "dashboard" && activeTab !== "approvals" && (
              <div className="relative w-full md:w-auto flex-grow md:flex-grow-0">

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    aria-label="Clear search"
                  >
                    <X
                      size={16}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    />
                  </button>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 md:p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-4 sm:space-y-6 p-2 sm:p-6">
              {/* Stats Cards - Enhanced Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {role !== "teacher" && (
                  <StatCard
                    icon={<Users size={24} className="text-indigo-500" />}
                    title="Total Teachers"
                    value={departmentStats?.totalTeachers || 0}
                    change={`${departmentStats?.activeTeachers || 0} active`}
                    color="indigo"
                    className="hover:scale-[1.02] transition-transform duration-200"
                  />
                )}

                <StatCard
                  icon={<GraduationCap size={24} className="text-blue-500" />}
                  title="Students"
                  value={departmentStats?.students || 0}
                  change={`${Math.floor(
                    (departmentStats?.students || 0) * 0.1
                  )} new this term`}
                  color="blue"
                  className="hover:scale-[1.02] transition-transform duration-200"
                />
                {role === "admin" && (
                  <StatCard
                    icon={<UserCog size={24} className="text-purple-500" />}
                    title="HODs"
                    value={departmentStats?.hods || 0}
                    change={`${departmentStats?.departments || 0} departments`}
                    color="purple"
                  />
                )}
                <StatCard
                  icon={<BookOpen size={24} className="text-emerald-500" />}
                  title="Subjects"
                  value={Object.values(
                    countByProperty(teacherPerformance, "subject")
                  ).reduce((a, b) => a + b, 0)}
                  change={`${Math.max(
                    ...Object.values(
                      countByProperty(teacherPerformance, "subject")
                    )
                  )} in most popular`}
                  color="green"
                  className="hover:scale-[1.02] transition-transform duration-200"
                />
                <StatCard
                  icon={<MessageSquare size={24} className="text-purple-500" />}
                  title="Chatbot Usage"
                  value={studentData.reduce(
                    (sum, s) => sum + (Number(s.message_count) || 0),
                    0
                  )}
                  change={`${Math.round(
                    studentData.reduce(
                      (sum, s) => sum + (Number(s.message_count) || 0),
                      0
                    ) / studentData.length
                  )} avg/student`}
                  color="purple"
                  className="hover:scale-[1.02] transition-transform duration-200"
                />
              </div>

              {/* Teacher Analytics Section */}
              {role !== "teacher" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 transition-all duration-300 hover:shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-0">
                      Teacher Analytics
                      <span className="block text-sm text-gray-500 font-normal mt-1">
                        Performance and distribution metrics
                      </span>
                    </h2>
                    <div className="flex space-x-2">
                      <button className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-medium hover:bg-gray-200 transition-colors">
                        View All
                      </button>
                      <button className="text-xs px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full font-medium hover:bg-indigo-200 transition-colors">
                        Export
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Enhanced Subject Distribution Card */}
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                          <BookOpen
                            size={18}
                            className="mr-2 text-indigo-500"
                          />
                          Subject Distribution
                        </h3>
                        <div className="text-xs px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full font-medium mt-2 sm:mt-0">
                          {Object.values(
                            countByProperty(teacherPerformance, "subject")
                          ).reduce((a, b) => a + b, 0)}{" "}
                          Subjects
                        </div>
                      </div>

                      <div className="h-64 sm:h-80 relative">
                        <Doughnut
                          data={{
                            labels: Object.keys(
                              countByProperty(teacherPerformance, "subject")
                            ),
                            datasets: [
                              {
                                data: Object.values(
                                  countByProperty(teacherPerformance, "subject")
                                ),
                                backgroundColor: [
                                  "rgba(99, 102, 241, 0.8)",
                                  "rgba(16, 185, 129, 0.8)",
                                  "rgba(245, 158, 11, 0.8)",
                                  "rgba(244, 63, 94, 0.8)",
                                  "rgba(139, 92, 246, 0.8)",
                                  "rgba(59, 130, 246, 0.8)",
                                  "rgba(20, 184, 166, 0.8)",
                                  "rgba(234, 88, 12, 0.8)",
                                ],
                                borderColor: "rgba(255, 255, 255, 0.9)",
                                borderWidth: 2,
                                cutout: "70%",
                                radius: "85%",
                                hoverOffset: 20,
                                hoverBorderWidth: 3,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position:
                                  window.innerWidth < 640 ? "bottom" : "right",
                                labels: {
                                  color: "#374151",
                                  font: {
                                    family: "Inter",
                                    size: window.innerWidth < 640 ? 10 : 12,
                                    weight: "500",
                                  },
                                  boxWidth: window.innerWidth < 640 ? 10 : 12,
                                  padding: 12,
                                  usePointStyle: true,
                                  pointStyle: "circle",
                                },
                              },
                              tooltip: {
                                backgroundColor: "rgba(17, 24, 39, 0.95)",
                                titleColor: "#F9FAFB",
                                bodyColor: "#E5E7EB",
                                borderColor: "#4B5563",
                                borderWidth: 1,
                                padding: 12,
                                cornerRadius: 8,
                                displayColors: true,
                                callbacks: {
                                  label: (context) => {
                                    const total = context.dataset.data.reduce(
                                      (a, b) => a + b,
                                      0
                                    );
                                    const value = context.raw;
                                    const percentage = Math.round(
                                      (value / total) * 100
                                    );
                                    return ` ${context.label}: ${value} (${percentage}%)`;
                                  },
                                },
                              },
                            },
                            animation: {
                              animateScale: true,
                              animateRotate: true,
                              duration: 1000,
                              easing: "easeOutQuart",
                            },
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="text-center">
                            <div className="text-xl sm:text-2xl font-bold text-gray-700">
                              {
                                Object.keys(
                                  countByProperty(teacherPerformance, "subject")
                                ).length
                              }
                            </div>
                            <div className="text-xs text-gray-500 font-medium">
                              Unique Subjects
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {Object.entries(
                          countByProperty(teacherPerformance, "subject")
                        ).map(([subject, count], index) => {
                          const colors = [
                            "bg-indigo-500",
                            "bg-emerald-500",
                            "bg-amber-500",
                            "bg-rose-500",
                            "bg-purple-500",
                            "bg-blue-500",
                            "bg-teal-500",
                            "bg-orange-500",
                          ];
                          return (
                            <div
                              key={index}
                              className={`text-xs px-2 py-1 rounded-full ${colors[index % colors.length]
                                } text-white flex items-center truncate hover:scale-105 transition-transform`}
                              title={`${subject}: ${count}`}
                            >
                              <span className="w-2 h-2 rounded-full bg-white/30 mr-1 sm:mr-2 flex-shrink-0"></span>
                              <span className="truncate">
                                {subject}: {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Enhanced Qualification Overview Card */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                          <Award size={18} className="mr-2 text-blue-500" />
                          Qualification Overview
                        </h3>
                        <div className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium mt-2 sm:mt-0">
                          {teacherPerformance.length} Teachers
                        </div>
                      </div>

                      <div className="h-64 sm:h-80">
                        <Bar
                          data={{
                            labels: Object.keys(
                              countByProperty(
                                teacherPerformance,
                                "qualification"
                              )
                            ),
                            datasets: [
                              {
                                label: "Teachers",
                                data: Object.values(
                                  countByProperty(
                                    teacherPerformance,
                                    "qualification"
                                  )
                                ),
                                backgroundColor: [
                                  "rgba(101, 116, 255, 0.8)",
                                  "rgba(87, 206, 167, 0.8)",
                                  "rgba(255, 159, 67, 0.8)",
                                  "rgba(255, 99, 132, 0.8)",
                                  "rgba(153, 102, 255, 0.8)",
                                  "rgba(54, 162, 235, 0.8)",
                                ],
                                borderColor: [
                                  "rgba(101, 116, 255, 1)",
                                  "rgba(87, 206, 167, 1)",
                                  "rgba(255, 159, 67, 1)",
                                  "rgba(255, 99, 132, 1)",
                                  "rgba(153, 102, 255, 1)",
                                  "rgba(54, 162, 235, 1)",
                                ],
                                borderWidth: 1,
                                borderRadius: 8,
                                borderSkipped: false,
                                hoverBackgroundColor: [
                                  "rgba(101, 116, 255, 1)",
                                  "rgba(87, 206, 167, 1)",
                                  "rgba(255, 159, 67, 1)",
                                  "rgba(255, 99, 132, 1)",
                                  "rgba(153, 102, 255, 1)",
                                  "rgba(54, 162, 235, 1)",
                                ],
                                hoverBorderWidth: 2,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                backgroundColor: "rgba(17, 24, 39, 0.95)",
                                titleColor: "#F9FAFB",
                                bodyColor: "#E5E7EB",
                                borderColor: "#4B5563",
                                borderWidth: 1,
                                padding: 12,
                                cornerRadius: 8,
                                callbacks: {
                                  label: (context) =>
                                    `${context.raw} ${context.raw === 1 ? "teacher" : "teachers"
                                    }`,
                                  footer: (tooltipItems) => {
                                    const total =
                                      tooltipItems[0].dataset.data.reduce(
                                        (a, b) => a + b,
                                        0
                                      );
                                    return `Represents ${Math.round(
                                      (tooltipItems[0].raw / total) * 100
                                    )}% of faculty`;
                                  },
                                },
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                grid: {
                                  color: "rgba(229, 231, 235, 0.8)",
                                  drawBorder: false,
                                },
                                ticks: {
                                  color: "#6B7280",
                                  precision: 0,
                                  font: {
                                    size: window.innerWidth < 640 ? 10 : 12,
                                  },
                                },
                              },
                              x: {
                                grid: {
                                  display: false,
                                  drawBorder: false,
                                },
                                ticks: {
                                  color: "#6B7280",
                                  font: {
                                    size: window.innerWidth < 640 ? 10 : 12,
                                    weight: "500",
                                  },
                                },
                              },
                            },
                            animation: {
                              duration: 1000,
                              easing: "easeOutQuart",
                            },
                          }}
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 justify-center px-2">
                        {Object.entries(
                          countByProperty(teacherPerformance, "qualification")
                        ).map(([qual, count], index) => {
                          const colors = [
                            "bg-indigo-100 text-indigo-800",
                            "bg-emerald-100 text-emerald-800",
                            "bg-amber-100 text-amber-800",
                            "bg-rose-100 text-rose-800",
                            "bg-purple-100 text-purple-800",
                            "bg-blue-100 text-blue-800",
                          ];
                          return (
                            <div
                              key={index}
                              className={`text-xs px-3 py-1 rounded-full ${colors[index % colors.length]
                                } flex items-center hover:shadow-sm transition-shadow`}
                            >
                              <span
                                className="w-2 h-2 rounded-full mr-2 opacity-70"
                                style={{
                                  backgroundColor: colors[index % colors.length]
                                    .split(" ")[0]
                                    .replace("bg-", "")
                                    .replace("-100", "-500"),
                                }}
                              ></span>
                              {qual}: {count}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {role === "admin" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mt-6">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">
                    HOD Analytics
                  </h2>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                    {/* HODs by Department (Donut) */}
                    <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm md:shadow-lg border border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-2">
                        <h3 className="text-base md:text-lg lg:text-xl font-bold text-gray-800">
                          Department Distribution
                        </h3>
                        <div className="text-xs px-2 py-1 md:px-3 md:py-1 bg-indigo-100 text-indigo-800 rounded-full font-medium self-start sm:self-auto">
                          {departmentStats?.hods || 0} HODs
                        </div>
                      </div>

                      <div className="h-64 sm:h-72 md:h-80 relative">
                        <Doughnut
                          data={{
                            labels: Object.keys(
                              countByProperty(hodsData, "department_expertise")
                            ),
                            datasets: [
                              {
                                data: Object.values(
                                  countByProperty(
                                    hodsData,
                                    "department_expertise"
                                  )
                                ),
                                backgroundColor: [
                                  "rgba(99, 102, 241, 0.8)",
                                  "rgba(16, 185, 129, 0.8)",
                                  "rgba(245, 158, 11, 0.8)",
                                  "rgba(244, 63, 94, 0.8)",
                                  "rgba(139, 92, 246, 0.8)",
                                  "rgba(59, 130, 246, 0.8)",
                                  "rgba(20, 184, 166, 0.8)",
                                  "rgba(234, 88, 12, 0.8)",
                                ],
                                borderColor: "rgba(255, 255, 255, 0.8)",
                                borderWidth: 1.5,
                                cutout: "70%",
                                radius: "85%",
                                hoverOffset: 12,
                                hoverBorderWidth: 2,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position:
                                  window.innerWidth < 640 ? "bottom" : "right",
                                labels: {
                                  color: "#374151",
                                  font: {
                                    family: "Inter",
                                    size: window.innerWidth < 640 ? 10 : 12,
                                    weight: "500",
                                  },
                                  boxWidth: 8,
                                  padding: 12,
                                  usePointStyle: true,
                                  pointStyle: "circle",
                                },
                              },
                              tooltip: {
                                backgroundColor: "rgba(31, 41, 55, 0.95)",
                                titleColor: "#F3F4F6",
                                bodyColor: "#E5E7EB",
                                borderColor: "#4B5563",
                                borderWidth: 1,
                                padding: 10,
                                cornerRadius: 6,
                                displayColors: true,
                                callbacks: {
                                  label: (context) => {
                                    const total = context.dataset.data.reduce(
                                      (a, b) => a + b,
                                      0
                                    );
                                    const value = context.raw;
                                    const percentage = Math.round(
                                      (value / total) * 100
                                    );
                                    return ` ${context.label}: ${value} (${percentage}%)`;
                                  },
                                },
                              },
                            },
                            animation: {
                              animateScale: true,
                              animateRotate: true,
                              duration: 800,
                              easing: "easeOutQuart",
                            },
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="text-center">
                            <div className="text-xl md:text-2xl font-bold text-gray-700">
                              {departmentStats?.departments || 0}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">
                              Departments
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 md:mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 md:gap-2">
                        {Object.entries(
                          countByProperty(hodsData, "department_expertise")
                        ).map(([dept, count], index) => {
                          const colors = [
                            "bg-indigo-500 text-white",
                            "bg-emerald-500 text-white",
                            "bg-amber-500 text-white",
                            "bg-rose-500 text-white",
                            "bg-purple-500 text-white",
                            "bg-blue-500 text-white",
                            "bg-teal-500 text-white",
                            "bg-orange-500 text-white",
                          ];
                          return (
                            <div
                              key={index}
                              className={`text-[10px] xs:text-xs px-2 py-0.5 md:px-3 md:py-1 rounded-full ${colors[index % colors.length]
                                } flex items-center truncate`}
                              title={`${dept}: ${count}`}
                            >
                              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white/30 mr-1 md:mr-2 shrink-0"></span>
                              <span className="truncate">
                                {dept.split(" ")[0]}: {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* HOD Experience (Bar) */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm md:shadow-lg border border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 md:mb-4 gap-2">
                        <h3 className="text-base md:text-lg lg:text-xl font-bold text-gray-800">
                          Experience Overview
                        </h3>
                        <div className="text-xs px-2 py-1 md:px-3 md:py-1 bg-indigo-100 text-indigo-800 rounded-full self-start sm:self-auto">
                          {hodsData.length} HODs
                        </div>
                      </div>

                      <div className="h-64 sm:h-72 md:h-80">
                        <Bar
                          data={{
                            labels: hodsData.map((hod) =>
                              window.innerWidth < 640
                                ? hod.fullname.split(" ")[0]
                                : hod.fullname
                            ),
                            datasets: [
                              {
                                label: "Years of Experience",
                                data: hodsData.map(
                                  (hod) => hod.experience || 0
                                ),
                                backgroundColor: "rgba(101, 116, 255, 0.8)",
                                borderColor: "rgba(101, 116, 255, 1)",
                                borderWidth: 1,
                                borderRadius: 8,
                                hoverBackgroundColor: "rgba(101, 116, 255, 1)",
                                hoverBorderWidth: 1.5,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                backgroundColor: "rgba(31, 41, 55, 0.95)",
                                titleColor: "#F3F4F6",
                                bodyColor: "#E5E7EB",
                                borderColor: "#4B5563",
                                borderWidth: 1,
                                padding: 10,
                                cornerRadius: 6,
                                callbacks: {
                                  label: (context) =>
                                    `${context.raw} years experience`,
                                  title: (context) =>
                                    hodsData[context[0].dataIndex].fullname,
                                },
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                grid: {
                                  color: "rgba(229, 231, 235, 0.8)",
                                  drawBorder: false,
                                },
                                ticks: {
                                  color: "#6B7280",
                                  precision: 0,
                                  font: {
                                    size: window.innerWidth < 640 ? 10 : 12,
                                  },
                                },
                              },
                              x: {
                                grid: {
                                  display: false,
                                  drawBorder: false,
                                },
                                ticks: {
                                  color: "#6B7280",
                                  font: {
                                    size: window.innerWidth < 640 ? 10 : 12,
                                    weight: "500",
                                  },
                                  maxRotation: window.innerWidth < 640 ? 45 : 0,
                                  autoSkip: true,
                                  maxTicksLimit:
                                    window.innerWidth < 640 ? 6 : 10,
                                },
                              },
                            },
                            animation: {
                              duration: 800,
                              easing: "easeOutQuart",
                            },
                          }}
                        />
                      </div>

                      <div className="mt-3 md:mt-4 flex items-center justify-center">
                        <div className="text-xs md:text-sm text-gray-600">
                          Avg experience:{" "}
                          <span className="font-medium">
                            {hodsData.length > 0
                              ? (
                                hodsData.reduce(
                                  (sum, hod) => sum + (hod.experience || 0),
                                  0
                                ) / hodsData.length
                              ).toFixed(1)
                              : 0}{" "}
                            years
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Student Analytics Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 transition-all duration-300 hover:shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                      Student Analytics
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Performance and engagement metrics across all standards
                    </p>
                  </div>
                  <div className="flex space-x-2 mt-3 sm:mt-0">
                    <button className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-medium hover:bg-gray-200 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Enhanced Standard Distribution Card */}
                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <Layers size={18} className="mr-2 text-blue-500" />
                        Standard Distribution
                      </h3>
                      <div className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium mt-2 sm:mt-0">
                        {Object.values(
                          countByProperty(studentData, "std")
                        ).reduce((a, b) => a + b, 0)}{" "}
                        Students
                      </div>
                    </div>

                    <div className="h-64 sm:h-80 relative">
                      <Doughnut
                        data={{
                          labels: Object.keys(
                            countByProperty(studentData, "std")
                          )
                            .sort((a, b) => parseInt(a) - parseInt(b))
                            .map((std) => `${std}th`),
                          datasets: [
                            {
                              data: Object.keys(
                                countByProperty(studentData, "std")
                              )
                                .sort((a, b) => parseInt(a) - parseInt(b))
                                .map(
                                  (std) =>
                                    countByProperty(studentData, "std")[std]
                                ),
                              backgroundColor: [
                                "rgba(59, 130, 246, 0.8)", // 6th
                                "rgba(16, 185, 129, 0.8)", // 7th
                                "rgba(245, 158, 11, 0.8)", // 8th
                                "rgba(244, 63, 94, 0.8)", // 9th
                                "rgba(139, 92, 246, 0.8)", // 10th
                                "rgba(20, 184, 166, 0.8)", // 11th
                                "rgba(249, 115, 22, 0.8)", // 12th
                              ],
                              borderColor: "rgba(255, 255, 255, 0.9)",
                              borderWidth: 2,
                              cutout: "70%",
                              radius: "85%",
                              hoverOffset: 20,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position:
                                window.innerWidth < 640 ? "bottom" : "right",
                              labels: {
                                color: "#374151",
                                font: {
                                  size: window.innerWidth < 640 ? 10 : 12,
                                  weight: "500",
                                },
                                padding: 12,
                                usePointStyle: true,
                              },
                            },
                            tooltip: {
                              backgroundColor: "rgba(17, 24, 39, 0.95)",
                              titleColor: "#F9FAFB",
                              bodyColor: "#E5E7EB",
                              borderColor: "#4B5563",
                              borderWidth: 1,
                              padding: 12,
                              cornerRadius: 8,
                              callbacks: {
                                label: (context) => {
                                  const total = context.dataset.data.reduce(
                                    (a, b) => a + b,
                                    0
                                  );
                                  const value = context.raw;
                                  const percentage = Math.round(
                                    (value / total) * 100
                                  );
                                  return ` ${context.label}: ${value} (${percentage}%)`;
                                },
                              },
                            },
                          },
                          animation: {
                            animateScale: true,
                            animateRotate: true,
                            duration: 1000,
                            easing: "easeOutQuart",
                          },
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <div className="text-xl sm:text-2xl font-bold text-gray-700">
                            {
                              Object.keys(countByProperty(studentData, "std"))
                                .length
                            }
                          </div>
                          <div className="text-xs font-medium">
                            Standards
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {Object.keys(countByProperty(studentData, "std"))
                        .sort((a, b) => parseInt(a) - parseInt(b))
                        .map((std, index) => {
                          const colors = [
                            "bg-blue-100 text-blue-800",
                            "bg-emerald-100 text-emerald-800",
                            "bg-amber-100 text-amber-800",
                            "bg-rose-100 text-rose-800",
                            "bg-purple-100 text-purple-800",
                            "bg-teal-100 text-teal-800",
                            "bg-orange-100 text-orange-800",
                          ];
                          return (
                            <div
                              key={std}
                              className={`${colors[index % colors.length]
                                } text-xs px-2 py-1 rounded-full flex items-center hover:shadow-sm transition-shadow w-30`}
                            >
                              <span
                                className="w-2 h-2 rounded-full mr-2 opacity-70"
                                style={{
                                  backgroundColor: colors[index % colors.length]
                                    .split(" ")[0]
                                    .replace("bg-", "")
                                    .replace("-100", "-500"),
                                }}
                              ></span>
                              {std}th:{" "}
                              {countByProperty(studentData, "std")[std]}
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Enhanced Chatbot Engagement Card */}
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Chatbot Engagement</h3>
                        <p className="text-sm text-gray-500">Message across classes 5-10</p>
                      </div>
                    </div>

                    <div className="h-80">
                      {(() => {
                        const grades = ['5th Standard', '6th Standard', '7th Standard', '8th Standard', '9th Standard', '10th Standard'];
                        const labels = grades.map(g => `${g}`);
                        const colors = [
                          'rgba(99, 102, 241, 0.8)',    // indigo-500
                          'rgba(16, 185, 129, 0.8)',     // emerald-500
                          'rgba(245, 158, 11, 0.8)',     // amber-500
                          'rgba(244, 63, 94, 0.8)',      // rose-500
                          'rgba(139, 92, 246, 0.8)',     // purple-500
                          'rgba(20, 184, 166, 0.8)'      // teal-500
                        ];

                        const data = grades.map(std =>
                          studentData
                            .filter(s => String(s.std).trim() === std)
                            .reduce((sum, s) => sum + (Number(s.message_count) || 0), 0)
                        );

                        return (
                          <Bar
                            data={{
                              labels,
                              datasets: [{
                                label: 'Messages',
                                data,
                                backgroundColor: colors,
                                borderColor: colors.map(c => c.replace('0.8', '1')),
                                borderWidth: 1.5,
                                borderRadius: 12,
                                hoverBackgroundColor: colors.map(c => c.replace('0.8', '0.9')),
                                hoverBorderWidth: 2
                              }]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { display: false },
                                tooltip: {
                                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                                  titleColor: '#f9fafb',
                                  bodyColor: '#e5e7eb',
                                  borderColor: '#4b5563',
                                  borderWidth: 1,
                                  padding: 12,
                                  cornerRadius: 8,
                                  callbacks: {
                                    label: (context) => `${context.raw} messages`,
                                    footer: (items) => {
                                      const total = items.reduce((sum, item) => sum + item.raw, 0);
                                      return `Average: ${Math.round(total / items.length)} messages/class`;
                                    }
                                  }
                                }
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  grid: {
                                    color: 'rgba(229, 231, 235, 0.5)',
                                    drawBorder: false
                                  },
                                  ticks: {
                                    precision: 0,
                                    color: '#6b7280'
                                  }
                                },
                                x: {
                                  grid: {
                                    display: false,
                                    drawBorder: false
                                  },
                                  ticks: {
                                    color: '#6b7280',
                                    font: {
                                      weight: '500'
                                    }
                                  }
                                }
                              },
                              animation: {
                                duration: 1000,
                                easing: 'easeOutQuart'
                              }
                            }}
                          />
                        );
                      })()}
                    </div>

                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {['5th Standard', '6th Standard', '7th Standard', '8th Standard', '9th Standard', '10th Standard'].map((std, i) => {
                        const count = studentData
                          .filter(s => String(s.std).trim() === std)
                          .reduce((sum, s) => sum + (Number(s.message_count) || 0), 0);

                        const colorClasses = [
                          'bg-indigo-100 text-indigo-800',
                          'bg-emerald-100 text-emerald-800',
                          'bg-amber-100 text-amber-800',
                          'bg-rose-100 text-rose-800',
                          'bg-purple-100 text-purple-800',
                          'bg-teal-100 text-teal-800'
                        ];

                        return (
                          <div
                            key={std}
                            className={`${colorClasses[i]} p-2 rounded-lg text-center shadow-sm`}
                          >
                            <p className="text-xs font-medium">{JSON.stringify(std.replace("Standard", ""))}</p>
                            <p className="text-lg font-bold">{count}</p>
                            <p className="text-[10px] opacity-75">messages</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "teachers" && role !== "teacher" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 transition-all duration-300 hover:shadow-md">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Teacher Management
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage all faculty members and their details
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <div className="relative flex-grow max-w-md">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search teachers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>

                  {role === "admin" && (
                    <button
                      onClick={() => setShowAddTeacherModal(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors duration-200"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Teacher
                    </button>
                  )}
                </div>
              </div>

              {/* Table Section */}
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-xs">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        <div className="flex items-center">
                          <span>Name</span>
                          <button
                            onClick={() => handleSort("name")}
                            className="ml-1 focus:outline-none"
                          >
                            <ChevronsUpDown
                              size={14}
                              className="text-gray-400 hover:text-gray-600"
                            />
                          </button>
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        Subject
                      </th>
                      <th
                        scope="col"
                        className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        Qualification
                      </th>
                      <th
                        scope="col"
                        className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        Experience
                      </th>
                      <th
                        scope="col"
                        className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentTeachers.length > 0 ? (
                      currentTeachers.map((teacher) => (
                        <tr
                          key={teacher.id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          {/* Name Column */}
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <User size={20} className="text-indigo-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {teacher.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {teacher.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Subject Column */}
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                                {teacher.subject || "General"}
                              </span>
                            </div>
                          </td>

                          {/* Qualification Column */}
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {teacher.qualification}
                              <div className="text-xs text-gray-500 mt-1">
                                {teacher.specialization || "General Education"}
                              </div>
                            </div>
                          </td>

                          {/* Experience Column */}
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      teacher.experience * 10
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm font-medium text-gray-900">
                                {teacher.experience}{" "}
                                {teacher.experience === 1 ? "Year" : "Years"}
                              </span>
                            </div>
                          </td>

                          {/* Actions Column */}
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleView(teacher)}
                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                                title="View details"
                              >
                                <Eye size={18} />
                              </button>

                              {role !== "teacher" && (
                                <button
                                  onClick={() => handleEdit(teacher)}
                                  className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-50 transition-colors"
                                  title="Edit"
                                >
                                  <Pencil size={18} />
                                </button>
                              )}

                              {role === "admin" && (
                                <button
                                  onClick={() =>
                                    handleDelete(
                                      "teacher",
                                      teacher.id,
                                      setTeachersData,
                                      teachersData
                                    )
                                  }
                                  className="text-rose-600 hover:text-rose-900 p-1 rounded-full hover:bg-rose-50 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <UserX size={48} className="mb-4 opacity-50" />
                            <p className="text-lg font-medium">
                              No teachers found
                            </p>
                            <p className="text-sm mt-1">
                              {searchQuery
                                ? "Try a different search term"
                                : "Add a new teacher to get started"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add Teacher Modal */}
              <AnimatePresence>
                {showAddTeacherModal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ type: "spring", damping: 20 }}
                      className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-bold text-gray-800">
                            Add New Teacher
                          </h2>
                          <button
                            onClick={() => setShowAddTeacherModal(false)}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>

                      <form
                        onSubmit={handleAddTeacher}
                        className="p-6 space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Full Name */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="fullname"
                              value={newTeacherData.fullname}
                              onChange={handleNewTeacherChange}
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter full name"
                            />
                          </div>

                          {/* Email */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={newTeacherData.email}
                              onChange={handleNewTeacherChange}
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter email address"
                            />
                          </div>

                          {/* Qualification */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Highest Qualification{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="highest_qualification"
                              value={newTeacherData.highest_qualification}
                              onChange={handleNewTeacherChange}
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="E.g., Ph.D., M.Ed., B.Ed."
                            />
                          </div>

                          {/* Subject Expertise */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Subject Expertise{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="subject_expertise"
                              value={newTeacherData.subject_expertise}
                              onChange={handleNewTeacherChange}
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="E.g., Mathematics, Science"
                            />
                          </div>

                          {/* Experience */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Experience (years){" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              name="experience"
                              value={newTeacherData.experience}
                              onChange={handleNewTeacherChange}
                              required
                              min="0"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Years of teaching experience"
                            />
                          </div>

                          {/* Teaching Level */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Teaching Level{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="teaching_level"
                              value={newTeacherData.teaching_level}
                              onChange={handleNewTeacherChange}
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="E.g., Primary, Secondary, High School"
                            />
                          </div>
                        </div>

                        {/* Bio */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bio / About
                          </label>
                          <textarea
                            name="bio"
                            value={newTeacherData.bio}
                            onChange={handleNewTeacherChange}
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Brief description about the teacher"
                          ></textarea>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => setShowAddTeacherModal(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={addTeacherLoading}
                            className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center ${addTeacherLoading
                              ? "opacity-70 cursor-not-allowed"
                              : ""
                              }`}
                          >
                            {addTeacherLoading ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Processing...
                              </>
                            ) : (
                              "Add Teacher"
                            )}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pagination Section */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstRecord + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastRecord, filteredTeachers.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{filteredTeachers.length}</span>{" "}
                  teachers
                </div>

                <div className="flex items-center space-x-2">
                  {/* Page Size Selector */}
                  <div className="hidden sm:block">
                    <select
                      value={teachersPerPage}
                      onChange={(e) => {
                        setTeachersPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {[5, 10, 20, 50].map((size) => (
                        <option key={size} value={size}>
                          Show {size}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pagination Controls */}
                  <nav className="flex items-center space-x-1">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-md ${currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                      title="First page"
                    >
                      <ChevronsLeft size={16} />
                    </button>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className={`p-2 rounded-md ${currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                      title="Previous page"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex space-x-1">
                      {Array.from(
                        { length: Math.min(5, totalPagesTeachers) },
                        (_, i) => {
                          let pageNum;
                          if (totalPagesTeachers <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPagesTeachers - 2) {
                            pageNum = totalPagesTeachers - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${currentPage === pageNum
                                ? "bg-indigo-600 text-white"
                                : "text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}

                      {totalPagesTeachers > 5 &&
                        currentPage < totalPagesTeachers - 2 && (
                          <span className="flex items-end px-1">...</span>
                        )}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, totalPagesTeachers)
                        )
                      }
                      disabled={currentPage === totalPagesTeachers}
                      className={`p-2 rounded-md ${currentPage === totalPagesTeachers
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                      title="Next page"
                    >
                      <ChevronRight size={16} />
                    </button>

                    <button
                      onClick={() => setCurrentPage(totalPagesTeachers)}
                      disabled={currentPage === totalPagesTeachers}
                      className={`p-2 rounded-md ${currentPage === totalPagesTeachers
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                      title="Last page"
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}

          {editingTeacher && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  transition={{ type: "spring", damping: 25 }}
                  className="bg-white rounded-xl shadow-lg w-full max-w-2xl"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <motion.h3
                        className="text-lg font-semibold"
                        whileHover={{ scale: 1.01 }}
                      >
                        {isEditing
                          ? `Edit ${editingTeacher.name ? "Teacher" : "Student"
                          }`
                          : `${editingTeacher.name ? "Teacher" : "Student"
                          } Profile`}
                      </motion.h3>
                      <motion.button
                        onClick={() => setEditingTeacher(null)}
                        whileHover={{ rotate: 90, scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X size={20} />
                      </motion.button>
                    </div>

                    {isEditing ? (
                      <EditForm
                        data={editingTeacher}
                        type={
                          editingTeacher.roll_no
                            ? "student"
                            : editingTeacher.department_expertise
                              ? "hod"
                              : "teacher"
                        }
                        onSave={handleSave}
                        onCancel={() => setIsEditing(false)}
                      />
                    ) : (
                      <ViewProfile
                        data={editingTeacher}
                        type={
                          editingTeacher.roll_no
                            ? "student"
                            : editingTeacher.department_expertise
                              ? "hod"
                              : "teacher"
                        }
                        onEdit={() => setIsEditing(true)}
                      />
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}

          {activeTab === "students" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 md:mb-0">
                  Student Management
                </h2>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Roll No.
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Standard
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentStudents.map((student, index) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="text-sm font-medium text-gray-900">
                                {student.fullname}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-0">
                              <div className="text-sm text-gray-500">
                                {student.email || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            No. {student.roll_no || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {student.std || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleView(student)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3 cursor-pointer"
                          >
                            View
                          </button>
                          {role == "teacher" ? (
                            ""
                          ) : (
                            <button
                              onClick={() => handleEdit(student)}
                              className="text-gray-600 hover:text-gray-900 cursor-pointer"
                            >
                              Edit
                            </button>
                          )}
                          {role == "admin" && (
                            <button
                              className="text-[red] cursor-pointer ml-3"
                              onClick={() =>
                                handleDelete(
                                  "student",
                                  student.id,
                                  setStudentData,
                                  studentData
                                )
                              }
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between">
                <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                  Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastRecord, filteredStudents.length)}</span>{' '}
                  of <span className="font-medium">{filteredStudents.length}</span> students
                </div>

                <div className="flex items-center space-x-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === 1
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300'
                      }`}
                  >
                    Previous
                  </motion.button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPagesStudents }, (_, i) => i + 1).map(page => (
                    <motion.button
                      key={page}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === page
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300'
                        }`}
                    >
                      {page}
                    </motion.button>
                  ))}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPagesStudents))}
                    disabled={currentPage === totalPagesStudents}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === totalPagesStudents
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300'
                      }`}
                  >
                    Next
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hods' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 md:mb-0">HOD Management</h2>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search HODs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Filtered HODs */}
              {filteredHods.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Department
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Experience
                          </th>
                          {role === "admin" && (
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentHods.map((hod) => (
                          <tr key={hod.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <UserCog size={18} className="text-indigo-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{hod.fullname}</div>
                                  <div className="text-sm text-gray-500">{hod.phonenumber}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{hod.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                  {hod.department_expertise}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-indigo-600 h-2 rounded-full"
                                    style={{ width: `${Math.min(100, (hod.experience || 0) * 10)}%` }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-sm text-gray-600">{hod.experience} Years</span>
                              </div>
                            </td>
                            {role === "admin" && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-3">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleView(hod)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    View
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleEdit(hod)}
                                    className="text-gray-600 hover:text-gray-900"
                                  >
                                    Edit
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleDelete("hod", hod.id, setHodsData, hodsData)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Delete
                                  </motion.button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between">
                    <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                      Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(indexOfLastRecord, filteredHods.length)}</span>{' '}
                      of <span className="font-medium">{filteredHods.length}</span> HODs
                    </div>

                    <div className="flex items-center space-x-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === 1
                          ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                          : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300'
                          }`}
                      >
                        Previous
                      </motion.button>

                      {/* Page numbers */}
                      {Array.from({ length: totalPagesHods }, (_, i) => i + 1).map(page => (
                        <motion.button
                          key={page}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === page
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300'
                            }`}
                        >
                          {page}
                        </motion.button>
                      ))}

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPagesHods))}
                        disabled={currentPage === totalPagesHods}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === totalPagesHods
                          ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                          : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300'
                          }`}
                      >
                        Next
                      </motion.button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Search size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No HODs found</h3>
                  <p className="text-sm text-gray-500">
                    {searchQuery ? 'Try a different search term' : 'No HODs available in the system'}
                  </p>
                  {role === "admin" && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setEditingTeacher({
                          fullname: '',
                          email: '',
                          phonenumber: '',
                          department_expertise: '',
                          vision_department: '',
                          highest_qualification: '',
                          experience: 0
                        });
                        setIsEditing(true);
                      }}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Add New HOD
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Approvals Tab */}
          {activeTab === "approvals" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Teacher Approvals
                    </h2>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search
                          size={16}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="Search approvals..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {pendingApprovals.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {pendingApprovals.map((approval) => (
                      <div
                        key={approval.id}
                        className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleViewApproval(approval)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <Users size={18} className="text-indigo-600" />
                              </div>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">
                                {approval.teacher_name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {approval.subject}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-500">
                              Requested on{" "}
                              {new Date(
                                approval.requested_at
                              ).toLocaleDateString()}
                            </div>
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <div className="mx-auto w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle size={40} className="text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      No pending approvals
                    </h3>
                    <p className="text-sm text-gray-500">
                      All teacher registration requests have been processed.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Approval Modal */}
      <AnimatePresence>
        {showApprovalModal && selectedApproval && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Teacher Approval
                  </h3>
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Users size={20} className="text-indigo-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900">
                        {selectedApproval.teacher_name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {selectedApproval.subject}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Requested on{" "}
                        {new Date(
                          selectedApproval.requested_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qualification
                      </p>
                      <p className="text-sm text-gray-900">
                        {selectedApproval.highest_qualification ||
                          "Not specified"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Experience
                      </p>
                      <p className="text-sm text-gray-900">
                        {selectedApproval.experience || "0"} years
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bio
                    </p>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedApproval.bio || "No bio provided"}
                    </p>
                  </div>

                  {approvalDecision === "reject" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4">
                        <label
                          htmlFor="rejectionReason"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Reason for Rejection
                        </label>
                        <textarea
                          id="rejectionReason"
                          rows={3}
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Provide a reason for rejecting this application..."
                          required
                        />
                      </div>
                    </motion.div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    {!approvalDecision ? (
                      <>
                        <button
                          onClick={() => setApprovalDecision("reject")}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => setApprovalDecision("approve")}
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Approve
                        </button>
                      </>
                    ) : approvalDecision === "approve" ? (
                      <button
                        onClick={handleApproveTeacher}
                        disabled={approvalLoading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {approvalLoading ? "Approving..." : "Confirm Approval"}
                      </button>
                    ) : (
                      <button
                        onClick={handleRejectTeacher}
                        disabled={approvalLoading || !rejectionReason}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {approvalLoading ? "Rejecting..." : "Confirm Rejection"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// StatCard Component
const StatCard = ({ icon, title, value, change, color, onClick }) => {
  const colorClasses = {
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      hover: "hover:bg-indigo-100",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      hover: "hover:bg-blue-100",
    },
    green: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      hover: "hover:bg-emerald-100",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      hover: "hover:bg-amber-100",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      hover: "hover:bg-purple-100",
    },
  };

  // Default to indigo if color is not found in colorClasses
  const safeColor = colorClasses[color] ? color : "indigo";

  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={onClick}
      className={`${colorClasses[safeColor].bg} ${onClick ? "cursor-pointer " + colorClasses[safeColor].hover : ""
        } p-6 rounded-xl shadow-sm border border-gray-100 transition-all`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[safeColor].bg}`}>
          {icon}
        </div>
      </div>
      <p className={`text-sm ${colorClasses[safeColor].text} mt-3`}>{change}</p>
    </motion.div>
  );
};

export default HODDashboard;
