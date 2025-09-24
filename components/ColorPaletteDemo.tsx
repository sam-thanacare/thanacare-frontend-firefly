'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { brandColors } from '@/lib/config/colors';

export function ColorPaletteDemo() {
  const primaryColors = [
    {
      name: 'Main Color',
      value: brandColors.mainColor,
      class: 'bg-main-color',
    },
    {
      name: 'Secondary Color',
      value: brandColors.secondaryColor,
      class: 'bg-secondary-color',
    },
    {
      name: 'Pure White',
      value: brandColors.pureWhite,
      class: 'bg-pure-white border',
    },
  ];

  const secondaryColors = [
    { name: 'Xiketic', value: brandColors.xiketic, class: 'bg-xiketic' },
    {
      name: 'Space Blue',
      value: brandColors.spaceBlue,
      class: 'bg-space-blue',
    },
    { name: 'Slate', value: brandColors.slate, class: 'bg-slate' },
    { name: 'Stone', value: brandColors.stone, class: 'bg-stone' },
  ];

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Thanacare Brand Colors
        </h2>
        <p className="text-muted-foreground mb-6">
          Official color palette for the Thanacare application
        </p>
      </div>

      {/* Primary Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Primary Colors</CardTitle>
          <CardDescription>
            Main brand colors used for primary actions and branding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {primaryColors.map((color) => (
              <div key={color.name} className="space-y-2">
                <div className={`w-full h-20 rounded-lg ${color.class}`} />
                <div>
                  <p className="font-medium text-foreground">{color.name}</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {color.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Secondary Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Secondary Colors</CardTitle>
          <CardDescription>
            Supporting colors for backgrounds, borders, and secondary elements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {secondaryColors.map((color) => (
              <div key={color.name} className="space-y-2">
                <div className={`w-full h-20 rounded-lg ${color.class}`} />
                <div>
                  <p className="font-medium text-foreground">{color.name}</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {color.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
          <CardDescription>
            How the colors are used in different UI elements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-primary text-primary-foreground">
              Primary Badge
            </Badge>
            <Badge className="bg-secondary text-secondary-foreground">
              Secondary Badge
            </Badge>
            <Badge className="bg-accent text-accent-foreground">
              Accent Badge
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-card border rounded-lg">
              <h4 className="font-semibold text-card-foreground mb-2">
                Card Example
              </h4>
              <p className="text-muted-foreground text-sm">
                This card uses the semantic color tokens for consistent theming.
              </p>
            </div>

            <div className="p-4 bg-muted border rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Muted Card</h4>
              <p className="text-muted-foreground text-sm">
                Muted backgrounds provide subtle contrast for secondary content.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
