// FooterNav.tsx
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import tw from 'tailwind-react-native-classnames';

interface FooterNavProps {
  activeScreen: string;
  setCurrentScreen: (screen: string) => void;
}

const FooterNav: React.FC<FooterNavProps> = ({ activeScreen, setCurrentScreen }) => {
  const navItems = [
    { icon: 'home', label: 'Home', screen: 'home' },
    { icon: 'book', label: 'Journal', screen: 'journal' },
    { icon: 'flag', label: 'Goals', screen: 'goals' },
    { icon: 'bar-chart', label: 'Insights', screen: 'insights' },
    { icon: 'settings', label: 'Settings', screen: 'settings' },
  ];

  return (
    <View style={tw`flex-row justify-around bg-white border-t border-gray-300 py-2 absolute bottom-0 left-0 right-0 max-w-96 self-center`}>
      {navItems.map(({ icon, label, screen }) => (
        <TouchableOpacity
          key={screen}
          style={tw`items-center py-1`}
          onPress={() => setCurrentScreen(screen)}
        >
          <Icon
            name={icon}
            size={18}
            color={activeScreen === screen ? '#e100ffff' : '#999'}
          />
          <Text style={[
            tw`text-xs mt-1`,
            { color: activeScreen === screen ? '#e100ffff' : '#999' }
          ]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default FooterNav;