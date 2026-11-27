import { Navigate, Route, Routes } from "react-router-dom";
import Nav from "../../features/pos/layout/PosNav";
import PosOverview from "../../features/pos/overview/PosOverview";
import PosOrder from "../../features/pos/orders/PosOrder";
import PosCategory from "../../features/pos/categories/PosCategory";
import PosProduct from "../../features/pos/products/PosProduct";
import PosCustomer from "../../features/pos/customers/PosCustomer";
import PosInventory from "../../features/pos/inventory/PosInventory";
import PosReport from "../../features/pos/reports/PosReport";
import PosSetting from "../../features/pos/settings/PosSetting";
import AddProduct from "../../features/pos/products/PosProductAdd";
import PosGeneralSetting from "../../features/pos/settings/pages/GeneralSetting";
import StaffManagement from "../../features/pos/settings/pages/StaffManagement";
import PosPaymentTax from "../../features/pos/settings/pages/PaymentTax";
import PosApperance from "../../features/pos/settings/pages/Appearance";
import Login from "../../features/auth/pages/Login";
import PosLogin from "../../features/auth/pages/PosLogin";
import AcademicLogin from "../../features/auth/pages/AcademicLogin";
import PosProtectedRoute from "../../shared/hooks/PosProtectedRoute";
import GuestRoute from "../../shared/hooks/GuestRoute";
import ClassNav from "../../features/training/layout/ClassNav";
import ClassOverview from "../../features/training/overview/pages/ClassOverview";
import ClassStudent from "../../features/training/students/pages/ClassStudent";
import AddStudentForm from "../../features/training/students/pages/AddStudent";
import ClassOrder from "../../features/canteen/pages/ClassOrder";
import ClassMenu from "../../features/canteen/pages/ClassMenu";
import ClassSetting from "../../features/training/settings/pages/ClassSetting";
import MobileOrder from "../../features/pos/orders/pages/MobileOrder";
import LocalOrder from "../../features/pos/orders/pages/LocalOrder";
import AddOrder from "../../features/pos/orders/pages/AddOrder";
import CourseManagement from "../../features/training/courses/pages/CourseManagement";
import BookingSchedule from "../../features/training/bookings/pages/ClassBookingSchedule";
import BookingList from "../../features/training/bookings/pages/ClassBookingList";
import VenueManagement from "../../features/training/venues/pages/ClassVenueManagement";
import AddMenu from "../../features/canteen/pages/AddMenu";
import ClassCourtDetail from "../../features/training/venues/components/ClassCourtAdd";
import ClassAddCourt from "../../features/training/venues/components/ClassAddCourt";
import CreateCourseModal from "../../features/training/courses/components/CreateCourseModal";
import NextProgramDetails from "../../features/training/courses/components/ClassNextProgramDetails";
import ClassCustomer from "../../features/training/students/pages/ClassCustomer";
import ClassMobileBooking from "../../features/training/bookings/pages/ClassMobileBooking";
import ClassLoaclBooking from "../../features/training/bookings/pages/ClassLocalBooking";
import ClassProtectedRoute from "../../shared/hooks/ClassProtectedRoute";
import ClassTrainingOverview from "../../features/training/overview/pages/ClassTrainingOverview";
import ClassRentalOverveiw from "../../features/rentals/pages/ClassRentalOverview";
import ClassCanteenOverview from "../../features/canteen/pages/ClassCanteenOverview";
import Courses from "../../features/training/courses/pages/Courses";
import AddClassForm from "../../features/training/courses/pages/CourseAddClass";
import ClassWalkIn from "../../features/rentals/pages/ClassWalkIn";
import WalkBooking from "../../features/rentals/pages/WalkBooking";
import WalkBookingList from "../../features/rentals/pages/WalkBookingList";


function AppRoutes() {
  return (
    <Routes>
            <Route
              path="/"
              element={
                <PosProtectedRoute>
                  <Nav />
                </PosProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/posoverview" replace />} />
              <Route path="posoverview" element={<PosOverview />} />
              <Route path="posorder" element={<PosOrder />}>
                <Route index element={<Navigate to="mobileorder" replace />} />
                <Route path="mobileorder" element={<MobileOrder />} />
                <Route path="localorder" element={<LocalOrder />} />
                <Route path="posaddorder" element={<AddOrder />} />
              </Route>
              <Route path="poscategory" element={<PosCategory />} />
              <Route path="posproduct" element={<PosProduct />}>
                <Route path="posaddproduct" element={<AddProduct />} />
              </Route>
              <Route path="poscustomer" element={<PosCustomer />} />
              <Route path="posinventory" element={<PosInventory />} />
              <Route path="posreport" element={<PosReport />} />
              <Route path="possetting" element={<PosSetting />}>
                <Route
                  index
                  element={<Navigate to="generalsetting" replace />}
                />
                <Route path="generalsetting" element={<PosGeneralSetting />} />
                <Route path="staffmanagement" element={<StaffManagement />} />
                <Route path="paymenttax" element={<PosPaymentTax />} />
                <Route path="apperance" element={<PosApperance />} />
              </Route>
            </Route>

            <Route
              path="/class"
              element={
                <ClassProtectedRoute>
                  <ClassNav />
                </ClassProtectedRoute>
              }
            >
              <Route index element={<Navigate to="classoverview" replace />} />
              <Route path="classoverview" element={<ClassOverview />}>
                <Route
                  index
                  element={<Navigate to="classtrainingoverview" />}
                />
                <Route
                  path="classtrainingoverview"
                  element={<ClassTrainingOverview />}
                />
                <Route
                  path="classrentaloverview"
                  element={<ClassRentalOverveiw />}
                />
                <Route
                  path="classcanteenoverview"
                  element={<ClassCanteenOverview />}
                />
              </Route>
              <Route path="classcourses" element={<Courses />}>
                <Route path="add_courseclass" element={<AddClassForm />} />
              </Route>
              <Route
                path="classcoursemanagement"
                element={<CourseManagement />}
              >
                <Route
                  path="classcoursemanagementnewcourt1"
                  element={<CreateCourseModal />}
                />
                <Route
                  path="classcoursemanagementnewcourt2"
                  element={<NextProgramDetails />}
                />
              </Route>
              <Route path="classstudent" element={<ClassStudent />}>
                <Route path="add_student" element={<AddStudentForm />} />
              </Route>
              <Route
                path="classbookingschedule"
                element={<BookingSchedule />}
              />
              <Route path="classbookinglist" element={<BookingList />}>
                <Route
                  index
                  element={<Navigate to="classmobilebooking" replace />}
                />
                <Route
                  path="classmobilebooking"
                  element={<ClassMobileBooking />}
                />
                <Route
                  path="classlocalbooking"
                  element={<ClassLoaclBooking />}
                />
              </Route>
              <Route path="classvenuemanagement" element={<VenueManagement />}>
                <Route path="classcourtdetail" element={<ClassCourtDetail />} />
                <Route path="classaddcourt" element={<ClassAddCourt />} />
              </Route>

              <Route path="classwalk-in" element={<ClassWalkIn />} />
              <Route path="booking-list" element={<WalkBookingList />} />
              <Route path="walkbooking" element={<WalkBooking />} />

              <Route path="classmember" element={<ClassCustomer />} />
              <Route path="classorder" element={<ClassOrder />}>
                <Route path="classorderaddmenu" element={<AddMenu />} />
              </Route>
              <Route path="classmenu" element={<ClassMenu />} />
              {/*  <Route path="classmanage" element={<ClassManage />}>
                <Route path="create" element={<CreateTournament />} />
                <Route path="edit/:id" element={<TournamentDetails />} />
              </Route>

              <Route path="classenrollments" element={<ClassEnrollments />} />
              <Route path="classpoints" element={<ClassPoints />} />
              <Route path="classbanners" element={<ClassBanners />} />*/}
              <Route path="classsetting" element={<ClassSetting />}>
                <Route
                  index
                  element={<Navigate to="generalsetting" replace />}
                />
                <Route path="generalsetting" element={<PosGeneralSetting />} />
                <Route path="staffmanagement" element={<StaffManagement />} />
                <Route path="paymenttax" element={<PosPaymentTax />} />
                <Route path="apperance" element={<PosApperance />} />
              </Route>
            </Route>

            <Route path="login" element={<Login />}>
              <Route index element={<Navigate to="poslogin" replace />} />
              <Route
                path="poslogin"
                element={
                  <GuestRoute loginType="pos">
                    <PosLogin />
                  </GuestRoute>
                }
              />
              <Route
                path="academiclogin"
                element={
                  <GuestRoute loginType="class">
                    <AcademicLogin />
                  </GuestRoute>
                }
              />
            </Route>
    </Routes>
  );
}

export default AppRoutes;
