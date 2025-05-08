"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface UserProfileCardProps {
  profile: {
    first_name: string;
    last_name: string;
    email?: string;
    role: string;
    avatar_url?: string;
    enzo?: any;
  };
  unreadCount: number;
  projectStats: {
    active: number;
    completed: number;
  };
}

export default function UserProfileCard({ profile, unreadCount, projectStats }: UserProfileCardProps) {
  const fullName = `${profile.first_name} ${profile.last_name}`;

  return (
    <Card className="p-6 shadow-md">
      <CardContent className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar_url || undefined} alt={fullName} />
            <AvatarFallback>
              {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{fullName}</h2>
            {profile.email && (
              <p className="text-muted-foreground text-sm">{profile.email}</p>
            )}
            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <span>Unread messages:</span>
              <Badge variant="secondary">{unreadCount}</Badge>
            </div>
          </div>
        </div>

        <Separator className="hidden sm:block h-16" orientation="vertical" />

        <div className="text-sm flex flex-col items-start sm:items-end gap-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Role:</span>
            <span className="font-medium text-primary">{profile.role}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Active Projects:</span>
            <Badge>{projectStats.active}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span>Completed Projects:</span>
            <Badge variant="outline">{projectStats.completed}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
