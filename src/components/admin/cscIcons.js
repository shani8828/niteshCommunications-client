import {
  Activity,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  CreditCard,
  FileText,
  Globe,
  Heart,
  Home,
  Landmark,
  MapPin,
  Printer,
  Shield,
  Smartphone,
  User,
} from "lucide-react";

// Icons a CSC service can use (stored by name in the database).
// Importing only these keeps the admin bundle from shipping every Lucide icon.
// Landmark and Printer are not offered in the picker but exist on saved services.
const CSC_ICONS = {
  Activity,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  CreditCard,
  FileText,
  Globe,
  Heart,
  Home,
  Landmark,
  MapPin,
  Printer,
  Shield,
  Smartphone,
  User,
};

export const getCscIcon = (name) => CSC_ICONS[name] || FileText;
