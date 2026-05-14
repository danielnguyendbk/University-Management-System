import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { UserPlus, Edit2, Ban, Search } from "lucide-react";
const initialUsers = [
  {
    id: 1,
    name: "John Admin",
    email: "admin@university.edu",
    role: "Admin",
    status: "Active"
  },
  {
    id: 2,
    name: "Sarah Staff",
    email: "sarah@university.edu",
    role: "Staff",
    status: "Active"
  },
  {
    id: 3,
    name: "Michael Johnson",
    email: "michael@university.edu",
    role: "Staff",
    status: "Active"
  },
  {
    id: 4,
    name: "Emily Brown",
    email: "emily@university.edu",
    role: "Staff",
    status: "Disabled"
  }
];
const UserManagementPage = () => {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Staff"
  });
  const filteredUsers = users.filter(
    (user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleAddUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.role) {
      return;
    }
    const user = {
      id: users.length + 1,
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      role: newUser.role,
      status: "Active"
    };
    setUsers([user, ...users]);
    setIsAddDialogOpen(false);
    setNewUser({ name: "", email: "", role: "Staff" });
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-gray-900", children: "User Management" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600 mt-1", children: "Manage system users and permissions" })
      ] }),
      /* @__PURE__ */ jsxs(Dialog, { open: isAddDialogOpen, onOpenChange: setIsAddDialogOpen, children: [
        /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { className: "bg-blue-600 hover:bg-blue-700", children: [
          /* @__PURE__ */ jsx(UserPlus, { className: "w-4 h-4 mr-2" }),
          "Add New User"
        ] }) }),
        /* @__PURE__ */ jsxs(DialogContent, { children: [
          /* @__PURE__ */ jsxs(DialogHeader, { children: [
            /* @__PURE__ */ jsx(DialogTitle, { children: "Add New User" }),
            /* @__PURE__ */ jsx(DialogDescription, { children: "Create a new user account for the system" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Full Name" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "name",
                  placeholder: "Enter full name",
                  value: newUser.name,
                  onChange: (e) => setNewUser({ ...newUser, name: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email Address" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "email",
                  type: "email",
                  placeholder: "user@university.edu",
                  value: newUser.email,
                  onChange: (e) => setNewUser({ ...newUser, email: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "role", children: "Role" }),
              /* @__PURE__ */ jsxs(Select, { value: newUser.role, onValueChange: (value) => setNewUser({ ...newUser, role: value }), children: [
                /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsx(SelectItem, { value: "Admin", children: "Admin" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "Staff", children: "Staff" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "Lecturer", children: "Lecturer" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "Employee", children: "Employee" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "Student", children: "Student" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setIsAddDialogOpen(false), children: "Cancel" }),
            /* @__PURE__ */ jsx(Button, { onClick: handleAddUser, className: "bg-blue-600 hover:bg-blue-700", children: "Add User" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200", children: [
      /* @__PURE__ */ jsx("div", { className: "p-4 border-b border-gray-200", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            placeholder: "Search users by name or email...",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            className: "pl-10"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Name" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Email" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Role" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: filteredUsers.map((user) => /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: user.name }),
          /* @__PURE__ */ jsx(TableCell, { children: user.email }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(
            Badge,
            {
              className: user.role === "Admin" ? "bg-purple-100 text-purple-700 hover:bg-purple-100" : user.role === "Staff" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : user.role === "Lecturer" ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-100" : user.role === "Employee" ? "bg-orange-100 text-orange-700 hover:bg-orange-100" : "bg-green-100 text-green-700 hover:bg-green-100",
              children: user.role
            }
          ) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(
            Badge,
            {
              className: user.status === "Active" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-700 hover:bg-gray-100",
              children: user.status
            }
          ) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
            /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", children: /* @__PURE__ */ jsx(Edit2, { className: "w-4 h-4" }) }),
            /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "text-red-600 hover:text-red-700", children: /* @__PURE__ */ jsx(Ban, { className: "w-4 h-4" }) })
          ] }) })
        ] }, user.id)) })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between px-4 py-3 border-t border-gray-200", children: /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-600", children: [
        "Showing ",
        filteredUsers.length,
        " of ",
        users.length,
        " users"
      ] }) })
    ] })
  ] });
};
export {
  UserManagementPage
};
