import { ExternalLink } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { Card, Screen, T } from '@/components/ui';
import { openTool, TOOLS } from '@/lib/tools';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';

export default function ToolsScreen() {
  const { c } = useTheme();
  return (
    <Screen>
      <View style={{ gap: 6 }}>
        <T v="h1">Инструменты</T>
        <T v="body">Калькуляторы и справочники для жизни во Вьетнаме</T>
      </View>
      {TOOLS.map(t => (
        <Card key={t.href} onPress={() => openTool(t.href)} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <View style={{ width: 52, height: 52, borderRadius: radius.md, backgroundColor: c.bgSecondary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 28 }}>{t.emoji}</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 15.5, color: c.textPrimary }}>{t.name}</Text>
            <T v="muted">{t.desc}</T>
          </View>
          {!t.native && <ExternalLink size={16} color={c.textMuted} />}
        </Card>
      ))}
    </Screen>
  );
}
