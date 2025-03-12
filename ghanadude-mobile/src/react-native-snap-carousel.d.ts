declare module 'react-native-snap-carousel' {
    import { Component } from 'react';
    import { FlatListProps, ScrollViewProps, ViewStyle, StyleProp } from 'react-native';
  
    export interface CarouselProps<T> extends FlatListProps<T> {
      data: T[];
      renderItem: (item: { item: T; index: number }) => JSX.Element;
      sliderWidth: number;
      itemWidth: number;
      firstItem?: number;
      inactiveSlideScale?: number;
      inactiveSlideOpacity?: number;
      loop?: boolean;
      autoplay?: boolean;
      autoplayInterval?: number;
      onSnapToItem?: (index: number) => void;
      contentContainerCustomStyle?: StyleProp<ViewStyle>;
      slideStyle?: StyleProp<ViewStyle>;
      hasParallaxImages?: boolean;
      removeClippedSubviews?: boolean;
    }
  
    export default class Carousel<T> extends Component<CarouselProps<T>> {}
  }
  