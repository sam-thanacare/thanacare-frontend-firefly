'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  acceptAllCookies,
  rejectNonNecessaryCookies,
  saveCookiePreferences,
  loadCookiePreferences,
} from '@/lib/store/slices/cookieSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings, Cookie } from 'lucide-react';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';

export function CookieFooter() {
  const dispatch = useAppDispatch();
  const { hasConsented, preferences, showBanner } = useAppSelector(
    (state) => state.cookies
  );

  const [showSettings, setShowSettings] = useState(false);
  const [tempPreferences, setTempPreferences] = useState(preferences);

  useEffect(() => {
    // Load preferences on component mount
    dispatch(loadCookiePreferences());
  }, [dispatch]);

  useEffect(() => {
    setTempPreferences(preferences);
  }, [preferences]);

  if (hasConsented && !showBanner) {
    return null;
  }

  const handleAcceptAll = () => {
    dispatch(acceptAllCookies());
  };

  const handleRejectAll = () => {
    dispatch(rejectNonNecessaryCookies());
  };

  const handleSavePreferences = () => {
    dispatch(saveCookiePreferences(tempPreferences));
    setShowSettings(false);
  };

  const handleManageCookies = () => {
    setShowSettings(true);
  };

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
        <Card className="rounded-none border-0 border-t">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Cookie className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1">
                    We value your privacy
                  </h3>
                  <p className="text-xs text-muted-foreground leading-snug">
                    We use cookies to enhance your browsing experience, serve
                    personalized content, and analyze our traffic. By clicking
                    &quot;Accept All&quot;, you consent to our use of cookies.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManageCookies}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Manage Cookies
                </Button>
                <Button variant="outline" size="sm" onClick={handleRejectAll}>
                  Reject All
                </Button>
                <Button size="sm" onClick={handleAcceptAll}>
                  Accept All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cookie Settings Popover */}
      <Popover open={showSettings} onOpenChange={setShowSettings}>
        <PopoverContent className="w-96 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              <h4 className="font-semibold">Cookie Preferences</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage your cookie preferences. You can enable or disable
              different types of cookies below.
            </p>

            <div className="space-y-6">
              {/* Necessary Cookies */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="necessary"
                    checked={tempPreferences.necessary}
                    disabled
                  />
                  <Label htmlFor="necessary" className="font-medium">
                    Necessary Cookies
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  These cookies are essential for the website to function and
                  cannot be switched off in our systems.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="analytics"
                    checked={tempPreferences.analytics}
                    onCheckedChange={(checked) =>
                      setTempPreferences((prev) => ({
                        ...prev,
                        analytics: !!checked,
                      }))
                    }
                  />
                  <Label htmlFor="analytics" className="font-medium">
                    Analytics Cookies
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  These cookies allow us to count visits and traffic sources so
                  we can measure and improve the performance of our site.
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="marketing"
                    checked={tempPreferences.marketing}
                    onCheckedChange={(checked) =>
                      setTempPreferences((prev) => ({
                        ...prev,
                        marketing: !!checked,
                      }))
                    }
                  />
                  <Label htmlFor="marketing" className="font-medium">
                    Marketing Cookies
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  These cookies may be set through our site by our advertising
                  partners to build a profile of your interests.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePreferences} className="flex-1">
                Save Preferences
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
