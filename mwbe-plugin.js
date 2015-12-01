;
(function($, window, document, undefined) {
    var pluginName = "mwbe", elements = [], optionsArr = [], count = 0, defaults = {
        bsCss: 'https://maps.raleighnc.gov/mwbe/bootstrap.min.css',
        bsJs: 'https://maps.raleighnc.gov/mwbe/bootstrap.min.js'
    };
    function Plugin(element, options) {
        var plugin = this;
        var vendors = [];
        this.element = element;
        elements.push(this.element);
        this.options = $.extend({}, defaults, options);
        optionsArr.push(this.options);
        this._defaults = defaults;
        this._name = pluginName;
        if (count === 0) {
            this.loadStyleSheet(this.options.bsCss, function() {
                plugin.loadScript(plugin.options.bsJs, function(loaded) {
                    if (loaded) {
                        plugin.init();
                    }
                });
            });
        }
        count += 1;
    }
    Plugin.prototype = {
        init: function() {
            var plugin = this;
            this.createCategoryButtons(this.element);
            this.createServiceList(this.element);
            $(this.element).append('<div style="margin: 1em"><input class="form-control" placeholder="Filter by Vendor Name" id="filterInput" style="margin-bottom: 1em" disabled/><form id="form" class="left"  action="https://maps.raleighnc.gov/php/sdmwob/scripts/exportcsv.php" method="POST"></form><form id="formAll" class="left"  action="https://maps.raleighnc.gov/php/sdmwob/scripts/exportcsv.php" method="POST"></form><div style="margin-bottom: 1em"><a id="csvLink" href="#" type="submit">Export Listed <span class="icon-file-excel"></span></a><a id="csvLinkAll" href="#" type="submit">Export All <span class="icon-file-excel"></span></a></div><div id="vendorDiv"></div></div>');
            this.createFilter($("#filterInput"));
            $("#csvLink").hide();
            document.getElementById("csvLink").onclick = function() {
                document.getElementById("form").submit();
            }
            document.getElementById("csvLinkAll").onclick = function() {
                plugin.exportAllToCsv ();
            }            
        },
        createCategoryButtons: function (element) {
            var plugin = this;
            $(element).append('<div style="margin: 1em"><label style="margin-bottom: 0.5em">Select A Business Category</label><br/><div class="btn-group" data-toggle="buttons" style="background-color: none; color: #3c71ce;"><label class="btn btn-primary"><input type="checkbox">Construction</label><label class="btn btn-primary"><input type="checkbox" autocomplete="off">Goods and Services</label><label class="btn btn-primary"><input type="checkbox" autocomplete="off">Professional</label</div></div>');
            $('.btn-group input').change(function (e) {
                var categories = [];
                $('.btn-group input:checked').each(function (i, service) {
                    categories.push("'" + $(service).parent().text() + "'");
                });
                if (categories.length > 0) {
                    $("#subServices").removeProp('disabled');
                    $("#filterInput").removeProp('disabled');
                    plugin.updateServiceList($("#subServices"), categories.toString());
                    plugin.getVendorsByCategory(categories.toString());                    
                } else {
                    $("#subServices").prop('disabled', true);
                    $("#filterInput").prop('disabled', true);
                    $("#csvLink").hide();
                    $("#vendorDiv").empty();
                }
            });
        },
        createServiceList: function (element) {
            var plugin = this;
            $(element).append('<div style="margin: 1em"><label style="margin-bottom: 0.5em">Select A Service</label><select id="subServices" class="form-control" disabled><option value="prompt">All Services</option></select></div>');
            $("#subServices").on('change', function (e) {
                plugin.getVendorsByService($("#subServices option:selected").val());
            });
            $.ajax({url: 'http://gisdevarc1/sdmwob/subservices.php?callback=?', dataType: 'json'}).done(function (data) {
                $.each(data, function (i, item) {
                    $("#subServices").append('<option value="'+item['Service ID']+'">'+item['Service']+'</option>');
                });
            });
        },
        createFilter: function (input) {
            var plugin = this;
            input.keyup(function (e) {
                plugin.filterVendors(vendors, $(this).val());
            });
        },
        filterVendors: function (vendors, text) {
            var plugin = this;
            var vendors = $(vendors).filter(function(index) {
                if (this.Company) {
                    return this.Company.toLowerCase().indexOf(text.toLowerCase()) == 0;
                }
            });
            $('#vendorDiv').empty();
            plugin.createList(vendors);
        },
        updateServiceList: function (select, categories) {
            $.ajax({url: 'https://maps.raleighnc.gov/mwbe/subservices.php?callback=?', dataType: 'json', data: {category: categories}}).done(function (data) {
                select.empty();
                select.append('<option value="prompt">All Services</option>');
                $.each(data, function (i, item) {
                    select.append('<option value="'+item['Service ID']+'">'+item['Service']+'</option>');
                });
            });
        },
        getVendorsByCategory: function (categories) {
            var plugin = this;
            $.ajax({url: 'https://maps.raleighnc.gov/mwbe/vendors.php?callback=?', dataType: 'json', data: {category: categories}}).done(function (data) {
                plugin.createList(data);
                vendors = data;
            });
        },
        getVendorsByService: function (service) {
            var plugin = this;
            $.ajax({url: 'https://maps.raleighnc.gov/mwbe/vendors.php?callback=?', dataType: 'json', data: {service: service}}).done(function (data) {
                plugin.createList(data);
                vendors = data;
            });
        },
        createList: function (vendors) {
            var plugin = this;
            var div = $('#vendorDiv');
            div.empty();
            var services = [],
                list = null,
                sList = null;
            if (vendors) {
                $.each(vendors, function (i, vendor) {
                    list = $('<ul class="left half nolist"></ul>').appendTo(div);
                    sList = $('<ul class="left half nolist"></ul>').appendTo(div);
                    if (vendor.Company) {
                        list.append('<li><strong>' + vendor.Company + '</strong></li>');
                    }
                    if (vendor ['First Name'] && vendor ['Last Name']) {
                        list.append('<li>' + vendor['First Name']+' '+vendor['Last Name'] + '</li>');
                    }
                    if (vendor.Address) {
                        list.append('<li>' + vendor.Address + '</li>');
                        list.append('<li>' + vendor.City + ', ' + vendor.State + ' ' +vendor.Zip);
                    }
                    if (vendor.Phone) {
                        list.append('<li>' + vendor.Phone + '</li>');
                    }
                    if (vendor['E-mail']) {
                        list.append('<li><a style="word-wrap:break-word;" href="mailto:'+vendor['E-mail']+'">'+vendor['E-mail']+'</a></li>');
                    }
                    if (vendor['Web-site']) {
                        if (vendor['Web-site'].indexOf('.') > -1) {
                            list.append('<li><a style="word-wrap:break-word;" href="http://'+vendor['Web-site']+'">'+vendor['Web-site']+'</a></li>');
                        }
                    }
                    if (vendor['Services']) {
                        var services = vendor['Services'].split('|'),
                            displayed = [];
                        sList.append('<em>Services: </em>').append(sList);
                        $.each(services, function(i, service) {
                            if ($.inArray(service, displayed) === -1) {
                                sList.append('<li><em>' + service + '</em></li>');
                            }
                            displayed.push(service);
                        });
                    }
                    if (!window.matchMedia("(max-width: 40em)").matches) {
                      /* the view port is at least 400 pixels wide */
                        if (list.height() >= sList.height()) {
                            sList.height(list.height());
                        } else {
                            list.height(sList.height());
                        }
                    }

                });
                $("#csvLink").show();
                plugin.exportToCsv(vendors, $("#form"));
            } else {
                div.append("No Vendors Found");
                $("#csvLink").hide();
            }
        },
        exportToCsv: function (data, form) {
            var csvContent = "Company,Person,Address,City,State,ZIP,Phone,Email,Web Site\r\n";
            $(data).each(function(index, vendor){
               var infoArray = [
                    vendor.Company ? '"' + vendor.Company + '"' : '""',
                    vendor['First Name'] &&  vendor['Last Name'] ? '"' + vendor['First Name'] + " " + vendor['Last Name'] + '"': '""',
                    vendor.Address ? '"' + vendor.Address + '"' : '""',
                    vendor.City ? '"' + vendor.City + '"' : '""',
                    vendor.State ? '"' + vendor.State + '"' : '""',
                    vendor.Zip ? '"' + vendor.Zip + '"' : '""',
                    vendor.Phone ? '"' + vendor.Phone + '"' : '""',
                    vendor['E-mail'] ? '"' + vendor['E-mail'] + '"' : '""',
                    vendor['Web-site'] ? '"' + vendor['Web-site'] + '"' : '""'
               ];
               dataString = infoArray.join(",");
               csvContent += dataString+ "\r\n";
            });
            form.empty();
            form.append("<textarea style='visibility:hidden;height:0;width:0;padding:0' name='csv'>"+csvContent+"</textarea>");
        },
        exportAllToCsv: function () {
            var plugin = this;
            var name = "";
            $.ajax({url: 'https://maps.raleighnc.gov/mwbe/vendors.php', dataType: 'jsonp'}).done(function (data) {
                if (data) {
                    plugin.exportToCsv(data, $("#formAll"));
                    document.getElementById("formAll").submit();
                }
            });
        },
        loadScript: function(url, callback) {
            var script = document.createElement("script")
            script.type = "text/javascript";
            if (script.readyState) {
                script.onreadystatechange = function() {
                    if (script.readyState == "loaded" || script.readyState == "complete") {
                        script.onreadystatechange = null;
                        callback(true);
                    }
                };
            } else {
                script.onload = function() {
                    callback(true);
                };
                script.onerror = function() {
                    callback(false);
                };
            }
            script.src = url;
            document.getElementsByTagName("head")[0].appendChild(script);
        },
        loadStyleSheet: function(url, callback) {
            if (document.createStyleSheet) {
                try {
                    document.createStyleSheet(url);
                } catch (e) {}
            } else {
                var css;
                css = document.createElement('link');
                css.rel = 'stylesheet';
                css.type = 'text/css';
                css.media = "all";
                css.href = url;
                document.getElementsByTagName("head")[0].appendChild(css);
            }
            callback();
        }
    };
    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            } else if ($.isFunction(Plugin.prototype[options])) {
                $.data(this, 'plugin_' + pluginName)[options]();
            }
        });
    }
})(jQuery, window, document);