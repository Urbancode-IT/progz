import logo from "../../assets/icon.png";
import { use, useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import API from "../../api/api";

const AdminDashboard = ({ children }) => {
 
  const quotes = [
    "Education is the most powerful weapon which you can use to change the world. - Nelson Mandela",
    "The beautiful thing about learning is that no one can take it away from you. - B.B. King",
    "Education is not preparation for life; education is life itself. - John Dewey",
    "The expert in anything was once a beginner. - Helen Hayes",
    "Learning is a treasure that will follow its owner everywhere. - Chinese Proverb",
  ];
  const [quote, setQuote] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 bg-[url('/Login.jpg')] bg-cover bg-center">
     
      {/* Header Section */}
            <header className="bg-gradient-to-b from-indigo-300 to-gray-100  ">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-3 sm:gap-0">
                  <div className="flex items-center gap-4">
                    <img
                      src={logo}
                      alt="Logo"
                      className="h-10 w-10 rounded-lg object-contain"
                    />
                    <div>
                      <h1 className="text-2xl font-bold text-gray-700">
                        UrbanCode — ProgZ
                      </h1>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <span>Administrator Dashboard</span>
                        <span className="hidden md:inline">•</span>
                        
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block px-3 py-1.5 text-gray-600 rounded-full text-sm font-medium">
                      <span className="hidden md:inline">
                          {currentTime.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })}
                        </span><br />
                      {currentTime.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
              {/* Quote Section */}
              {quote && (
              <div className="">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                  <p className="text-center text-sm text-black/90 italic">
                    "{quote}"
                  </p>
                </div>
              </div>
            )}
            </header>
             
            

            
      {/* Main Content */}
      <div className="flex flex-col sm:flex-row h-screen">
        <Sidebar />
        <div className="flex-1 py-4 sm:p-6 h-screen overflow-y-auto">
          <main className="bg-white rounded-xl shadow-sm p-4 sm:p-6 ">
            
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
