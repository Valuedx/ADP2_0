
import Navbar from "@/shared/components/Navbar";
import DashboardCards from "@/dashboard/components/DashboardCards";
import { Button } from "@/shared/components/ui/button";
import { Upload, User } from "lucide-react";
import { Link } from "react-router-dom";
import './Index.css';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Document Processing Dashboard</h1>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Link to="/uploaddoc" className="flex items-center gap-2">
              <Upload />
              <span>Upload Document</span>
            </Link>
          </Button>
        </div>

        <DashboardCards />

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Documents</h2>
          <div className="border rounded-lg overflow-hidden">
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
