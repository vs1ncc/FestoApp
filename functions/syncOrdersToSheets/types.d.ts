declare type OrderRecord = {
  order_number?: string | number;
  order_name?: string;
  price?: number | string;
  date?: string;
  client_name?: string;
  client_phone?: string;
  delivery_date?: string;
  status?: string;
};

declare namespace Deno {
  function serve(handler: (req: Request) => Promise<Response> | Response): void;
}

declare module "" {
  export function createClientFromRequest(req: Request): {
    auth: {
      me(): Promise<unknown | null>;
    };
    asServiceRole: {
      connectors: {
        getConnection(name: string): Promise<{ accessToken: string }>;
      };
      entities: {
        Setting: {
          filter(query: Record<string, unknown>): Promise<Array<{ key: string; value: string | null }>>;
          create(data: { key: string; value: string | null }): Promise<unknown>;
        };
        Order: {
          list(sort: string): Promise<OrderRecord[]>;
        };
      };
    };
  };
}
