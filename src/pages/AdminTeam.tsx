import { Protected } from "@/lib/protected-page";
import { AdminNavBar } from "@/components/admin/admin-navbar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Home, Users, Calendar, BarChart } from "lucide-react";

export default function AdminTeam() {
  const adminNavItems = [
    { name: 'Dashboard', url: '/admin-dashboard', icon: Home },
    { name: 'Team', url: '/admin-team', icon: Users },
    { name: 'Events', url: '/admin-events', icon: Calendar },
    { name: 'Communication', url: '/admin-communication', icon: BarChart },
  ];

  const members = useQuery(api.users.listMembers);

  return (
    <Protected>
      <div className="min-h-screen bg-background">
        <AdminNavBar items={adminNavItems} />
        <div className="container mx-auto px-4 py-20">
          <h1 className="text-3xl font-bold mb-6">Team Members</h1>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members?.map((member) => (
                <TableRow key={member._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.image} />
                        <AvatarFallback>{member.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                      {member.role}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Protected>
  );
}