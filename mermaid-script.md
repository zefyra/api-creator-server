


#### [Flowchart - mermaid-js](https://mermaid-js.github.io/mermaid/#/flowchart?id=an-invisisble-link)

#### [Sequence diagrams - mermaid-js](https://mermaid-js.github.io/mermaid/#/sequenceDiagram?id=sequence-diagrams)

### 填色


```mermaid
flowchart LR
    id1(Start)-->id2(Stop)
    style id1 fill:#f9f,stroke:#333,stroke-width:4px
    style id2 fill:#bbf,stroke:#f66,stroke-width:2px,color:#fff,stroke-dasharray: 5 5
```

把A定義為class，並且對該class填色

```mermaid
flowchart LR
    A:::someclass --> B
    classDef someclass fill:#999;
```


### 符號

```mermaid
flowchart TD
    B["fab:fa-twitter for peace"]
    B-->C[fa:fa-ban forbidden]
    B-->D(fa:fa-spinner);
    B-->E(A fa:fa-camera-retro perhaps?)
```

### 圓角


```mermaid
flowchart LR
    A[Hard edge] -->|Link text| B(Round edge)
    B --> C{Decision}
    C -->|One| D[Result one]
    C -->|Two| E[Result two]
```