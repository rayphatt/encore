import React, { useState } from 'react';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Card from '../Card/Card';
import styles from './Playground.module.css';

const CodePreview = ({ code }) => (
  <pre className={styles.codePreview}>
    <code>{code}</code>
  </pre>
);

const ComponentSection = ({ title, children, code }) => (
  <section className={styles.section}>
    <h2>{title}</h2>
    <div className={styles.componentContent}>
      <div className={styles.componentDemo}>
        {children}
      </div>
      {code && (
        <div className={styles.codeContainer}>
          <h3>Usage Example</h3>
          <CodePreview code={code} />
        </div>
      )}
    </div>
  </section>
);

const Playground = () => {
  const [inputValue, setInputValue] = useState('');
  const [hasError, setHasError] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const buttonCode = `<Button>Primary Button</Button>
<Button secondary>Secondary Button</Button>
<Button disabled>Disabled Button</Button>
<Button fullWidth>Full Width Button</Button>`;

  const inputCode = `<Input
  label="Regular Input"
  placeholder="Type something..."
  value={value}
  onChange={handleChange}
/>`;

  const cardCode = `<Card 
  title="Clickable Card"
  subtitle="Click me!"
  clickable
  onClick={handleClick}
>
  <p>Card content goes here</p>
</Card>`;

  return (
    <div className={styles.playground}>
      <h1>UI Component Playground</h1>
      
      <div className={styles.tabs}>
        <Button 
          onClick={() => setActiveTab('all')}
          secondary={activeTab !== 'all'}
        >
          All Components
        </Button>
        <Button 
          onClick={() => setActiveTab('buttons')}
          secondary={activeTab !== 'buttons'}
        >
          Buttons
        </Button>
        <Button 
          onClick={() => setActiveTab('inputs')}
          secondary={activeTab !== 'inputs'}
        >
          Inputs
        </Button>
        <Button 
          onClick={() => setActiveTab('cards')}
          secondary={activeTab !== 'cards'}
        >
          Cards
        </Button>
      </div>

      {(activeTab === 'all' || activeTab === 'buttons') && (
        <ComponentSection title="Buttons" code={buttonCode}>
          <div className={styles.componentRow}>
            <Button>Primary Button</Button>
            <Button secondary>Secondary Button</Button>
            <Button disabled>Disabled Button</Button>
            <Button fullWidth>Full Width Button</Button>
          </div>
        </ComponentSection>
      )}

      {(activeTab === 'all' || activeTab === 'inputs') && (
        <ComponentSection title="Inputs" code={inputCode}>
          <div className={styles.componentColumn}>
            <Input
              label="Regular Input"
              placeholder="Type something..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Input
              label="Required Input"
              placeholder="Required field"
              required
            />
            <Input
              label="Error Input"
              placeholder="With error message"
              error={hasError ? "This is an error message" : ""}
              onFocus={() => setHasError(true)}
              onBlur={() => setHasError(false)}
            />
            <Input
              label="Disabled Input"
              placeholder="Disabled"
              disabled
            />
          </div>
        </ComponentSection>
      )}

      {(activeTab === 'all' || activeTab === 'cards') && (
        <ComponentSection title="Cards" code={cardCode}>
          <div className={styles.componentColumn}>
            <Card title="Basic Card" subtitle="With subtitle">
              <p>This is a basic card with some content.</p>
            </Card>

            <Card
              title="Clickable Card"
              subtitle="Click me!"
              clickable
              onClick={() => alert('Card clicked!')}
            >
              <p>This card is clickable and has hover effects.</p>
            </Card>

            <Card>
              <p>A simple card without header.</p>
            </Card>
          </div>
        </ComponentSection>
      )}

      {activeTab === 'all' && (
        <ComponentSection title="Component Combinations">
          <div className={styles.componentColumn}>
            <Card title="Sign Up Form Example">
              <form className={styles.form}>
                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter password"
                  required
                />
                <Button type="submit" fullWidth>
                  Sign Up
                </Button>
              </form>
            </Card>
          </div>
        </ComponentSection>
      )}
    </div>
  );
};

export default Playground; 