import React from 'react';

import { Row, Col } from '../dist/index.esm.js';

export default {
  title: 'Grid',
};

const colStyles = { backgroundColor: '#ccc' };

export const Grid = () => (
  <Row>
    <Col sizes={{ sm: 4, m: 6, l: 3 }}>
      <div style={colStyles}>Col 1</div>
    </Col>
    <Col sizes={{ sm: 4, m: 3, l: 6 }}>
      <div style={colStyles}>Col 2</div>
    </Col>
    <Col sizes={{ sm: 4, m: 3, l: 3 }}>
      <div style={colStyles}>Col 3</div>
    </Col>
    <Col sizes={{ sm: 4, m: 6, l: 3 }}>
      <div style={colStyles}>Col 1</div>
    </Col>
    <Col sizes={{ sm: 4, m: 3, l: 6 }}>
      <div style={colStyles}>Col 2</div>
    </Col>
    <Col sizes={{ sm: 4, m: 3, l: 3 }}>
      <div style={colStyles}>Col 3</div>
    </Col>
  </Row>
);
