import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Bell, X } from "lucide-react";
import type { NotificationDTO } from "../../types";

/**
 * Komponent NotificationsPanel - wyświetla powiadomienia o oczekujących akcjach.
 */
interface NotificationsPanelProps {
  notifications: NotificationDTO[];
}

export function NotificationsPanel({ notifications }: NotificationsPanelProps) {
  const handleAction = (actionUrl: string) => {
    window.location.href = actionUrl;
  };

  const handleDismiss = (notificationId: number) => {
    // TODO: Implement dismiss logic
    console.log("Dismiss notification:", notificationId);
  };

  if (notifications.length === 0) {
    return null; // Nie wyświetlaj panelu jeśli nie ma powiadomień
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Bell className="h-5 w-5" />
          Powiadomienia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-start justify-between p-3 bg-white border border-orange-200 rounded-lg"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-900">{notification.message}</p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAction(notification.actionUrl)}
                className="text-orange-700 border-orange-300 hover:bg-orange-100"
              >
                Zobacz
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDismiss(notification.id)}
                className="text-orange-600 hover:bg-orange-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
