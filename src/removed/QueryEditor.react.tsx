import React, { PureComponent } from 'react';
import { SegmentAsync, Segment, FormField } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from '../DataSource';
import { OpcUaQuery, OpcUaDataSourceOptions, OpcUaBrowseResults } from '../types';
import { SegmentFrame, SegmentLabel } from '../components/SegmentFrame';

const selectText = (t: string): string => `Select <${t}>`;

type Props = QueryEditorProps<DataSource, OpcUaQuery, OpcUaDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    const { onChange, query } = this.props;

    if (!query.readType) {
      onChange({ ...query, readType: 'Processed' });
    }
  }

  onChange = (variable: string, value: any) => {
    console.log('changing', variable, value);
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, [variable]: value });
    onRunQuery(); // executes the query
  };

  getTreeData = (): Promise<Array<SelectableValue<any>>> => {
    return this.props.datasource.flatBrowse().then((results: OpcUaBrowseResults[]) => {
      return results.map((item: OpcUaBrowseResults) => ({
        label: item.displayName,
        key: item.nodeId,
        description: item.nodeId,
        value: item,
      }));
    });
  };

  browseNode = (nodeId: string): Promise<Array<SelectableValue<any>>> => {
    return this.props.datasource.browse(nodeId).then((results: OpcUaBrowseResults[]) => {
      return results.map((item: OpcUaBrowseResults) => ({
        label: item.displayName,
        key: item.nodeId,
        description: item.displayName,
        value: item,
      }));
    });
  };

  render() {
    return (
      <>
        <SegmentFrame label="Tag">
          <SegmentAsync
            value={this.props.query.metric ? this.props.query.metric.displayName : selectText('metric')}
            loadOptions={this.getTreeData}
            onChange={e => e.value && this.onChange('metric', e.value)}
          />
          <SegmentLabel label={'Read Type'} />
          <Segment<any>
            value={this.props.query.readType ? this.props.query.readType : 'Processed'}
            options={[
              { label: 'Raw', value: 'Raw' },
              { label: 'Processed', value: 'Processed' },
            ]}
            onChange={e => e.value && this.onChange('readType', e.value)}
          />
          <SegmentLabel label={'Aggregate'} />
          <SegmentAsync
            value={this.props.query.aggregate ? this.props.query.aggregate.displayName : selectText('aggregate')}
            loadOptions={() => this.browseNode('i=2997')}
            onChange={e => e.value && this.onChange('aggregate', e.value)}
          />
          <FormField label={'Interval'} value={'$__interval'} />
        </SegmentFrame>
      </>
    );
  }
}
