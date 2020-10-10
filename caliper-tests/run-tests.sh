for variable in {10..500..10}
do
    TPSNUM=$variable
    perl -i -pe "s/tps: \d*/tps: ${TPSNUM}/" ./benchmarks/myAssetBenchmark.yaml
    caliper launch master --caliper-benchconfig benchmarks/myAssetBenchmark.yaml --caliper-networkconfig networks/network_config.json --caliper-workspace ./ --caliper-flow-only-test --caliper-fabric-gateway-usegateway --caliper-fabric-gateway-discovery
    mv report.html reports/report-fiveWorkers-tps${TPSNUM}.html
done