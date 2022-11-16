

# AAAA

```mermaid
graph TD
    A --> B
    A --> C
    B --> D
    C --> D
```

```mermaid
flowchart TD
    A[Deploy] --> B{is it Fri?}
    B -- Yes --> C[Do not deploy!]
    B -- No --> D[Run install.sh to deploy!]
    B -->|Three| F[AAA:BBB]
    D --> E
    C --> E
```