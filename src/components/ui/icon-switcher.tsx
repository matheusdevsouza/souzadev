import type { IconProps } from "@phosphor-icons/react";
import type React from "react";
import {
  ArrowSquareOut,
  Database,
  DiamondsFour,
  Drop,
  EnvelopeSimple,
  Lightbulb,
  LinkSimple,
  MapPin,
  RocketLaunch,
  ShoppingCart,
  Sparkle,
  Target,
  TrendUp,
  WhatsappLogo,
  Buildings,
  CubeTransparent,
  WaveSquare,
  CirclesThreePlus,
  Code,
  Lock,
  Star,
  Users,
  ShoppingBag,
  Circle,
  Hexagon,
} from "@phosphor-icons/react/dist/ssr";

const iconMap = {
  "arrow-out": ArrowSquareOut,
  sparkle: Sparkle,
  briefing: Lightbulb,
  design: Sparkle,
  desenvolvimento: Code,
  lancamento: RocketLaunch,
  buildings: Buildings,
  "shopping-cart": ShoppingCart,
  "shopping-bag": ShoppingBag,
  target: Target,
  link: LinkSimple,
  "trend-up": TrendUp,
  react: Hexagon,
  "react-logo": Hexagon,
  "next-logo": CirclesThreePlus,
  "node-logo": Circle,
  database: Database,
  drop: Drop,
  "wave-square": WaveSquare,
  cube: CubeTransparent,
  "cube-transparent": CubeTransparent,
  "diamonds-four": DiamondsFour,
  whatsapp: WhatsappLogo,
  "whatsapp-logo": WhatsappLogo,
  envelope: EnvelopeSimple,
  "envelope-simple": EnvelopeSimple,
  "map-pin": MapPin,
  process: RocketLaunch,
  "rocket-launch": RocketLaunch,
  lock: Lock,
  star: Star,
  users: Users,
} satisfies Record<string, React.ComponentType<IconProps>>;

type IconSwitcherProps = IconProps & {
  name: keyof typeof iconMap | string;
};

export function IconSwitcher({ name, size = 24, ...rest }: IconSwitcherProps) {
  const IconComponent =
    iconMap[name as keyof typeof iconMap] ?? Sparkle;

  return <IconComponent size={size} weight="duotone" {...rest} />;
}

