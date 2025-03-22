// types/react-csv.d.ts

declare module 'react-csv' {
    import * as React from 'react';
  
    export interface CSVLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
      data: object[] | string;
      headers?: object[];
      separator?: string;
      enclosingCharacter?: string;
      filename?: string;
      uFEFF?: boolean;
      target?: '_blank' | '_self';
      asyncOnClick?: boolean;
      onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void | boolean;
    }
  
    export class CSVLink extends React.Component<CSVLinkProps, any> {}
  }
  