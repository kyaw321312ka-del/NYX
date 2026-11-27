import HeaderIcon from "@mui/icons-material/Inventory2Outlined";
import CheckIcon from "@mui/icons-material/CheckCircleOutlined";
import OutIcon from "@mui/icons-material/ReportOutlined";
import NewIcon from "@mui/icons-material/VerifiedOutlined";
import TrainingIcon from "@mui/icons-material/SportsScore";
import CashIcon from "@mui/icons-material/PaymentsOutlined";
import PersonIcon from "@mui/icons-material/PeopleAltOutlined";
import PersonIcon1 from "@mui/icons-material/PersonAddAltOutlined";

export const headerdata = [
  {
    header: "Total Order",
    body: "1200",
    footer: "Yesterday 1133",
  },
  {
    header: "Total Pending",
    body: "95",
    footer: "Yesterday 83",
  },
  {
    header: "Total Completed",
    body: "456",
    footer: "Yesterday 455",
  },
  {
    header: "Total Cancel",
    body: "33",
    footer: "Yesterday 333",
  },
];

//for class order table
export const classOrdertable = [
  {
    order_id: 1000,
    order_item: "apple,grape,orange",
    amount: 20000,
    payment: "KBZ pay",
    payment_proof: "photo.file",
  },
  {
    order_id: 1000,
    order_item: "apple,grape,orange",
    amount: 20000,
    payment: "KBZ pay",
    payment_proof: "photo.file",
  },
  {
    order_id: 1000,
    order_item: "apple,grape,orange",
    amount: 20000,
    payment: "KBZ pay",
    payment_proof: "photo.file",
  },
  {
    order_id: 1000,
    order_item: "apple,grape,orangedfsdfdsfasdfdsafsdafdsfasdf",
    amount: 20000,
    payment: "KBZ pay",
    payment_proof: "photo.file",
  },
];

//for classmenu
export const orderheadingdata = [
  { title: "Total Menus", icon: HeaderIcon, amount: "345" },
  { title: "Avaliables Menus", icon: CheckIcon, amount: "345" },
  { title: "Out of Stock", icon: OutIcon, amount: "345" },
  { title: "New Arrival Menus", icon: NewIcon, amount: "Pasta and Noodles" },
];

export const classbookingheading = [
  { title: "Today bookings", icon: 1, info: 21 },
  { title: "Today bookings", icon: 2, info: 21 },
  { title: "Today bookings", icon: 3, info: 21 },
  { title: "Today bookings", icon: 4, info: 21 },
];

export const classtrainingoverview = [
  {
    icon: PersonIcon,
    rightside: "+5%",
    body: "Total Students",
    footer: "3",
    footerright: "students",
  },
  {
    icon: TrainingIcon,
    rightside: "current",
    body: "Active Training",
    footer: "3",
    footerright: "active classes",
  },
  {
    icon: CashIcon,
    rightside: "+10%",
    body: "Monthly Revenue",
    footer: "3",
    footerright: "ks",
  },
  {
    icon: PersonIcon1,
    rightside: "+This week",
    body: "New Enrollment",
    footer: "3",
    footerright: "students",
  },
];
