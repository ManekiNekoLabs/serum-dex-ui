import * as React from 'react';
import './index.css';
import {
  widget,
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
} from '../../charting_library';
import Datafeed from './datafeed';
import { useMarket, USE_MARKETS } from '../../utils/markets';
import * as saveLoadAdapter from './saveLoadAdapter';
import { flatten } from '../../utils/utils';
import { BONFIDA_DATA_FEED } from '../../utils/bonfidaConnector';
import {useState} from "react";
import {ENV, TokenListProvider} from "@solana/spl-token-registry";
import {sessionCache} from "../../utils";

export interface ChartContainerProps {
  symbol: ChartingLibraryWidgetOptions['symbol'];
  interval: ChartingLibraryWidgetOptions['interval'];
  auto_save_delay: ChartingLibraryWidgetOptions['auto_save_delay'];

  // BEWARE: no trailing slash is expected in feed URL
  // datafeed: any;
  datafeedUrl: string;
  libraryPath: ChartingLibraryWidgetOptions['library_path'];
  chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url'];
  chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version'];
  clientId: ChartingLibraryWidgetOptions['client_id'];
  userId: ChartingLibraryWidgetOptions['user_id'];
  fullscreen: ChartingLibraryWidgetOptions['fullscreen'];
  autosize: ChartingLibraryWidgetOptions['autosize'];
  studiesOverrides: ChartingLibraryWidgetOptions['studies_overrides'];
  containerId: ChartingLibraryWidgetOptions['container_id'];
  theme: string;
}

export interface ChartContainerState {}

export const TVChartContainer = () => {
  // let datafeed = useTvDataFeed();
  const defaultProps: ChartContainerProps = {
    symbol: 'BTC/USDC',
    // @ts-ignore
    interval: '60',
    auto_save_delay: 5,
    theme: 'Dark',
    containerId: 'tv_chart_container',
    // datafeed: datafeed,
    libraryPath: '/charting_library/',
    chartsStorageApiVersion: '1.1',
    clientId: 'dex.nekiswap.com',
    userId: 'public_user_id',
    fullscreen: false,
    autosize: true,
    datafeedUrl: BONFIDA_DATA_FEED,
    studiesOverrides: {}
  };

  const tvWidgetRef = React.useRef<IChartingLibraryWidget | null>(null);
  const { market } = useMarket();
  const [tokenMap, setTokenMap] = useState({});

  const chartProperties = JSON.parse(
      localStorage.getItem('chartproperties') || '{}',
  );

  React.useEffect(() => {
    // grab the token list convert it to tokenMap and save to sessionCache
    new TokenListProvider().resolve().then((tokens) => {
      const tokenList = tokens.filterByChainId(ENV.MainnetBeta).getList();
      const tokenMap = tokenList.reduce((map, item) => {
        if (
            !item.tags?.includes("lp-token") &&
            !item.tags?.includes("saber-stableswap-lp")
        ) {
          // @ts-ignore
          map[item.address] = item;
        }
        return map;
      }, {})

      setTokenMap(tokenMap);
      sessionCache.setItem("tokenMap", tokenMap);
      setTokenMap(tokenMap);
    });

    const savedProperties = flatten(chartProperties, {
      restrictTo: ['scalesProperties', 'paneProperties', 'tradingProperties'],
    });

    let baseLabel = USE_MARKETS.find((m) => m.address.toBase58() === market?.publicKey.toBase58(),)?.baseLabel;
    // console.log('baseLabel', baseLabel);
    let mintAddress = '';

    if (baseLabel !== undefined) {
      Object.entries(tokenMap).map(([key, value]) => {
        // @ts-ignore
        if (baseLabel === value.symbol) {
          // @ts-ignore
          mintAddress = value.address;
        }
      })
    }

    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: mintAddress || 'ALKiRVrfLgzeAV2mCT7cJHKg3ZoPvsCRSV7VCRWnE8zQ',
      // BEWARE: no trailing slash is expected in feed URL
      // tslint:disable-next-line:no-any

      datafeed: Datafeed,
      interval: defaultProps.interval as ChartingLibraryWidgetOptions['interval'],
      container_id: defaultProps.containerId as ChartingLibraryWidgetOptions['container_id'],
      library_path: defaultProps.libraryPath as string,
      auto_save_delay: 5,
      locale: 'en',
      disabled_features: ['use_localstorage_for_settings'],
      enabled_features: ['study_templates'],
      load_last_chart: true,
      client_id: defaultProps.clientId,
      user_id: defaultProps.userId,
      fullscreen: defaultProps.fullscreen,
      autosize: defaultProps.autosize,
      studies_overrides: defaultProps.studiesOverrides,
      theme: defaultProps.theme === 'Dark' ? 'Dark' : 'Light',
      overrides: {
        ...savedProperties,
        'mainSeriesProperties.candleStyle.upColor': '#41C77A',
        'mainSeriesProperties.candleStyle.downColor': '#F23B69',
        'mainSeriesProperties.candleStyle.borderUpColor': '#41C77A',
        'mainSeriesProperties.candleStyle.borderDownColor': '#F23B69',
        'mainSeriesProperties.candleStyle.wickUpColor': '#41C77A',
        'mainSeriesProperties.candleStyle.wickDownColor': '#F23B69',
      },
      // @ts-ignore
      save_load_adapter: saveLoadAdapter,
      settings_adapter: {
        initialSettings: {
          'trading.orderPanelSettingsBroker': JSON.stringify({
            showRelativePriceControl: false,
            showCurrencyRiskInQty: false,
            showPercentRiskInQty: false,
            showBracketsInCurrency: false,
            showBracketsInPercent: false,
          }),
          // "proterty"
          'trading.chart.proterty':
              localStorage.getItem('trading.chart.proterty') ||
              JSON.stringify({
                hideFloatingPanel: 1,
              }),
          'chart.favoriteDrawings':
              localStorage.getItem('chart.favoriteDrawings') ||
              JSON.stringify([]),
          'chart.favoriteDrawingsPosition':
              localStorage.getItem('chart.favoriteDrawingsPosition') ||
              JSON.stringify({}),
        },
        setValue: (key, value) => {
          localStorage.setItem(key, value);
        },
        removeValue: (key) => {
          localStorage.removeItem(key);
        },
      },
    };

    const tvWidget = new widget(widgetOptions);

    tvWidget.onChartReady(() => {
      tvWidgetRef.current = tvWidget;
      tvWidget
          // @ts-ignore
          .subscribe('onAutoSaveNeeded', () => tvWidget.saveChartToServer());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market, tvWidgetRef.current]);

  return <div id={defaultProps.containerId} className={'TVChartContainer'} />;
};
