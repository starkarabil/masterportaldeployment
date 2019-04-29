import dataJSON from "./cockpit_bauvorhaben.json";

/**
 * @returns {void}
 */
function initializeCockpitModel () {
    const CockpitModel = Radio.request("ModelList", "getModelByAttributes", {id: "cockpit"}),
        defaults = {
            "isViewMobile": false,
            "filterObject": {
                "districts": [],
                "years": [],
                "monthMode": true,
                "flatMode": false
            },
            "data": []
        };

    Object.assign(CockpitModel, {
        attributes: Object.assign(defaults, CockpitModel.attributes),

        /**
         * @returns {void}
         */
        initialize: function () {
            this.superInitialize();
            this.filterYears(dataJSON);
            this.filterDistricts(dataJSON);
            this.setData(dataJSON);
            this.trigger("render");
        },
        prepareDataForGraph: function () {
            const years = this.get("filterObject").years.sort(),
                districts = this.get("filterObject").districts,
                isMonthsSelected = this.get("filterObject").monthMode,
                isOnlyFlatSelected = this.get("filterObject").flatMode,
                data = this.get("data"),
                filteredData = this.filterData(data, districts, years, isOnlyFlatSelected),
                dataBaugenehmigungen = this.prepareData(filteredData, districts, years, isMonthsSelected, "building_project_count", {attributeName: "constructionStarted", values: [true, false]}),
                dataWohneinheiten = this.prepareData(filteredData, districts, years, isMonthsSelected, "living_unit_count", {attributeName: "constructionStarted", values: [true, false]}),
                dataWohneinheitenNochNichtImBau = this.prepareData(filteredData, districts, years, isMonthsSelected, "living_unit_count", {attributeName: "constructionStarted", values: [false]}),
                dataWohneinheitenImBau = this.prepareData(filteredData, districts, years, isMonthsSelected, "living_unit_count", {attributeName: "constructionStarted", values: [true]}),
                attributesToShow = [];

            if (filteredData.length > 0) {
                districts.forEach(function (district) {
                    switch (district) {
                        case "Altona": {
                            attributesToShow.push({attrName: district, attrClass: "graph-line-altona"});
                            break;
                        }
                        case "Bergedorf": {
                            attributesToShow.push({attrName: district, attrClass: "graph-line-bergedorf"});
                            break;
                        }
                        case "Eimsbüttel": {
                            attributesToShow.push({attrName: district, attrClass: "graph-line-eimsbuettel"});
                            break;
                        }
                        case "Hamburg-Mitte": {
                            attributesToShow.push({attrName: district, attrClass: "graph-line-hamburg-mitte"});
                            break;
                        }
                        case "Hamburg-Nord": {
                            attributesToShow.push({attrName: district, attrClass: "graph-line-hamburg-nord"});
                            break;
                        }
                        case "Harburg": {
                            attributesToShow.push({attrName: district, attrClass: "graph-line-harburg"});
                            break;
                        }
                        case "Wandsbek": {
                            attributesToShow.push({attrName: district, attrClass: "graph-line-wandsbek"});
                            break;
                        }
                        default: {
                            attributesToShow.push({attrName: district, attrClass: "line"});
                            break;
                        }
                    }
                });
                this.createGraph(dataBaugenehmigungen, ".graph-baugenehmigungen", ".graph-tooltip-div-1", attributesToShow, "date", isMonthsSelected);
                this.createGraph(dataWohneinheiten, ".graph-wohneinheiten", ".graph-tooltip-div-2", attributesToShow, "date", isMonthsSelected);
                this.createGraph(dataWohneinheitenNochNichtImBau, ".graph-wohneineinheiten-noch-nicht-im-bau", ".graph-tooltip-div-3", attributesToShow, "date", isMonthsSelected);
                this.createGraph(dataWohneinheitenImBau, ".graph-wohneineinheiten-im-bau", ".graph-tooltip-div-4", attributesToShow, "date", isMonthsSelected);
                if (isMonthsSelected) {
                    this.postprocessGraphs(years.length);
                }
            }
        },
        postprocessGraphs: function (segments) {
            const tickTexts = $.find(".xAxisDraw > .tick > text"),
                xAxisDraw = $.find(".xAxisDraw > .domain")[0],
                xAxisWidth = xAxisDraw.getBoundingClientRect().width,
                widthPerSegment = Math.round(xAxisWidth / segments);

            tickTexts.forEach(function (tickText) {
                tickText.innerHTML = tickText.innerHTML.substring(0, 4);
                $(tickText).attr("transform", "translate(" + widthPerSegment / 2 + ", 0)");
            });
        },
        filterData: function (data, districts, years, isOnlyFlatSelected) {
            const filteredDataByDistrict = this.filterByAttribute(data, districts, "district"),
                filteredDataByYear = this.filterByAttribute(data, years, "year"),
                filtered = this.intersectArrays(filteredDataByDistrict, filteredDataByYear);
            let filteredTotal = [];

            if (isOnlyFlatSelected) {
                filtered.forEach(function (obj) {
                    if (obj.living_unit_count > 0) {
                        filteredTotal.push(obj);
                    }
                });
            }
            else {
                filteredTotal = filtered;
            }

            return filteredTotal;
        },
        filterByAttribute: function (data, valuesArray, attributeName) {
            const filteredData = [];

            valuesArray.forEach(function (value) {
                const filteredDataByValue = data.filter(object => object[attributeName] === value);

                filteredDataByValue.forEach(function (object) {
                    filteredData.push(object);
                });
            });

            return filteredData;
        },
        intersectArrays: function (array1, array2) {
            const intersections = [];

            array1.forEach(function (object) {
                if (array2.includes(object)) {
                    intersections.push(object);
                }
            });
            return intersections;
        },
        prepareData: function (data, districts, years, isMonthsSelected, attrName, condition) {
            var preparedData = [],
                months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
                months_short = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

            districts.forEach(function (district) {
                years.forEach(function (year) {
                    months.forEach(function (month, i) {
                        let filteredObjs = data.filter(obj => obj.district === district && obj.year === year && obj.month === month);
                        const fakeObj = {};

                        if (filteredObjs.length > 1) {
                            filteredObjs = this.aggregateByValues(filteredObjs, condition, attrName);
                        }
                        // create fake data for each timestep
                        if (filteredObjs.length === 0) {
                            fakeObj.year = year;
                            fakeObj.month = month;
                            fakeObj.month_short = months_short[i];
                            fakeObj.district = district;
                            fakeObj[attrName] = 0;
                            filteredObjs.push(fakeObj);
                        }
                        if (filteredObjs.length === 1) {
                            preparedData.push(filteredObjs[0]);
                        }
                    }, this);
                }, this);
            }, this);
            preparedData = this.mergeMonthsToYears(preparedData, isMonthsSelected, years, districts, attrName);
            preparedData = this.mergeByAttribute(preparedData, "date", attrName);
            preparedData = this.addNullValues(preparedData, districts);
            preparedData = Radio.request("Util", "sort", preparedData, "date");
            return preparedData;
        },
        mergeMonthsToYears: function (data, isMonthsSelected, years, districts, attrName) {
            const preparedData = [];

            if (isMonthsSelected) {
                data.forEach(function (obj) {
                    obj.date = obj.year + obj.month_short;
                    preparedData.push(obj);
                }, this);
            }
            else {
                years.forEach(function (year) {
                    districts.forEach(function (district) {
                        const preparedYear = {
                                date: year,
                                district: district
                            },
                            prefilteredData = data.filter(obj => obj.year === year && obj.district === district),
                            aggregate = this.aggregateByValues(prefilteredData, {attributeName: "district", values: [district]}, attrName);

                        preparedYear[attrName] = aggregate[0][attrName];
                        preparedData.push(preparedYear);
                    }, this);
                }, this);
            }
            return preparedData;
        },
        addNullValues: function (data, districts) {
            data.forEach(function (obj) {
                districts.forEach(function (value) {
                    if (obj[value] === undefined) {
                        obj[value] = 0;
                    }
                });
            });
            return data;
        },
        mergeByAttribute: function (data, sortAttrName, mergeAttr) {
            let values = [];
            const mergedData = [];

            data.forEach(function (obj) {
                values.push(obj[sortAttrName]);
            });
            values.sort();
            values = values.filter((item, index)=> {
                return values.indexOf(item) === index;
            });
            values.forEach(function (value) {
                const filteredObjs = data.filter(obj => obj[sortAttrName] === value),
                    mergedObj = {};

                mergedObj[sortAttrName] = value;
                filteredObjs.forEach(function (obj) {
                    const district = obj.district;

                    mergedObj[district] = obj[mergeAttr];
                    mergedObj.class = "dot";
                    mergedObj.style = "circle";
                });
                mergedData.push(mergedObj);
            });

            return mergedData;
        },
        aggregateByValues: function (data, condition, attrName) {
            const conditionAttribute = condition.attributeName,
                conditionValues = condition.values,
                prefilteredData = this.filterByAttribute(data, conditionValues, conditionAttribute),
                aggregate = Object.assign({}, prefilteredData[0]);

            prefilteredData.forEach(function (obj, index) {
                if (index > 0) {
                    const objHasValue = conditionValues.includes(obj[conditionAttribute]);

                    if (objHasValue) {
                        aggregate[attrName] = aggregate[attrName] + obj[attrName];
                    }
                }
            });
            aggregate[conditionAttribute] = undefined;
            return [aggregate];
        },
        createGraph: function (data, selector, selectorTooltip, attributesToShow, xAttr, isMonthsSelected) {
            const xAxisTicks = this.createTicks(data, isMonthsSelected),
                graphConfig = {
                    graphType: "Linegraph",
                    selector: selector,
                    width: 400,
                    height: 250,
                    margin: {top: 20, right: 20, bottom: 50, left: 70},
                    svgClass: "graph-svg",
                    selectorTooltip: selectorTooltip,
                    scaleTypeX: "ordinal",
                    scaleTypeY: "linear",
                    data: data,
                    xAttr: xAttr,
                    xAxisTicks: xAxisTicks,
                    xAxisLabel: {
                        label: "Jahre",
                        translate: 20
                    },
                    yAxisLabel: {
                        label: "Anzahl",
                        offset: 10
                    },
                    attrToShowArray: attributesToShow,
                    legendData: []
                };

            Radio.trigger("Graph", "createGraph", graphConfig);
        },
        createTicks: function (data, isMonthsSelected) {
            let xAxisTicks;
            const values = [];

            if (isMonthsSelected) {
                data.forEach(function (obj) {
                    if (obj.date.length === 6 && obj.date.match(/.*01$/)) {
                        values.push(obj.date);
                    }
                });
                xAxisTicks = {
                    values: values
                };
            }

            return xAxisTicks;
        },
        filterYears: function (data) {
            const t = _.pluck(data, "year");

            this.setYears([...new Set(t)].sort(function (a, b) {
                return b - a;
            }));
        },

        filterDistricts: function (data) {
            const t = _.pluck(data, "district");

            this.setDistricts([...new Set(t)].sort());
        },

        updateLayer: function (filterObject) {
            const layer = Radio.request("ModelList", "getModelByAttributes", {id: "13872"});

            if (layer !== undefined) {
                const layers = [],
                    layerSource = layer.get("layer").getSource();

                filterObject.years.forEach(function (year) {
                    if (year !== 2010 && year !== 2019) {
                        layers.push("bauvorhaben_" + year + "_erledigt");
                    }
                });
                if (layers.length === 0) {
                    layerSource.updateParams({LAYERS: ","});
                }
                else {
                    layerSource.updateParams({LAYERS: layers.toString()});
                }
            }
        },

        setYears: function (value) {
            this.set("years", value);
        },

        setDistricts: function (value) {
            this.set("districts", value);
        },

        setData: function (value) {
            this.set("data", value);
        },

        setFilterObjectByKey: function (key, value) {
            this.get("filterObject")[key] = value;
            this.updateLayer(this.get("filterObject"));
        }
    });

    CockpitModel.initialize();
    return CockpitModel;
}

export default initializeCockpitModel;
